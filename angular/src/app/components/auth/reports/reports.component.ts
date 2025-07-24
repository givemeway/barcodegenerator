import { AuthService } from './../../auth.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router, ActivatedRoute, Params } from '@angular/router';

import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
var htmlToPdfmake = require('html-to-pdfmake');
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
})
export class ReportsComponent implements OnInit {
  @ViewChild('pdfTable')
  pdfTable!: ElementRef<any>;
  @ViewChild('dataContainer') dataContainer: ElementRef | undefined;

  startdate: Date;
  enddate: Date;
  params: any;
  textTop: any;
  svg: any;
  image: any;
  width: number = 48.5; //mm
  height: number = 25.4; //mm
  barcodesInSheet: number = 0;
  salesReport = [];
  TSReport = [];
  totalSalesReport = {};
  FollowupReport = [];
  isFiltered = false;
  selectedModule: any;
  showReport = false;
  Columns = [];
  Rows = [];
  RowsSelected: any;
  ColumnsSelected: any;
  ColumnTotal: any;
  isPopup = false;
  popupRowData = [];
  RowsData = [];
  showCustomerReport = false;
  showTSReport = false;
  selectedValue = [];
  excludedlist = [];
  excludedProperty: any;
  ispopup: any;
  slider_values: any;
  isLoading: boolean | undefined;
  RowTransformedDetails: any;
  changestoselectedvalue = false;
  isGenerate = false;
  barCodeInaRow: number = 0;
  page_margin: number[] = [];
  bytes_code: any;
  new_svg: SafeHtml | undefined;
  rows_columns_list: any;
  code_options: any = {};
  value: number = 1;

  img_width: any;
  isCopies: boolean = false;
  print_layout = [
    'Letter',
    'Tabloid',
    'Legal',
    'Statement',
    'Executive',
    'A3',
    'A5',
    'JIS B4',
    'JIS B5',
    'A4',
  ];
  fonts = ['sans-serif', 'serif', 'fantasy', 'cursive', 'monospace'];

  // size in mm
  paper_size = {
    Letter: [21.59 * 10, 27.94 * 10],
    Tabloid: [27.94 * 10, 43.18 * 10],
    Legal: [21.59 * 10, 35.56 * 10],
    Statement: [13.97 * 10, 21.59 * 10],
    Executive: [18.42 * 10, 26.67 * 10],
    A4: [21.0 * 10, 29.7 * 10],
    A3: [29.7 * 10, 42.0 * 10],
    A5: [14.8 * 10, 21.0 * 10],
    'JIS B4': [25.7 * 10, 36.4 * 10],
    'JIS B5': [18.2 * 10, 25.7 * 10],
  };
  //  *1 pixel = 0.2645833333 mm
  public downloadAsPDF() {
    const pdfTable = this.pdfTable.nativeElement;

    var html = htmlToPdfmake(pdfTable.innerHTML);
    const documentDefinition = { content: html };
    pdfMake.createPdf(documentDefinition).download('barcodes.pdf');
  }

  constructor(
    private sanitizer: DomSanitizer,
    private authservice: AuthService,
    public route: ActivatedRoute,
    private router: Router
  ) {
    this.startdate = new Date();
    this.enddate = new Date();
  }

  ngOnInit() {
    this.totalSalesReport = {
      Followup: 0,
      'Resolved Confirmed': 0,
      'Resolve Not Confirmed': 0,
      'Paid and Transferred': 0,
      Total: 0,
    };
    this.isFiltered = false;
    this.showTSReport = false;
    this.showCustomerReport = false;
    this.selectedValue = [];
    this.isPopup = false;
    this.excludedProperty = undefined;
    this.changestoselectedvalue = false;
    this.isGenerate = false;

    this.route.queryParams.subscribe((params: Params) => {
      if (!this.params) {
        this.params = 'Example 123';
        this.textTop = 'Example 123 Top';
        this.page_margin = [0, 0, 0, 0];
        this.code_options = {
          height: 40,
          fontSize: 11,
          marginLeft: 25,
          marginRight: 25,
          marginTop: 15,
          marginBottom: 5,
          width: 1,
          textAlign: 'center',
          textMargin: 0,
          letterSpacing: 1,
          barcodeWidth: 48.5,
          barcodeHeight: 25.4,
          // margin: 10,
          font: 'monospace',
          fontOptions: 'bold',
        };
      } else {
        this.params = params['code'];
        this.textTop = params['textTop'];
      }
      this.inputCode(this.params);
    });
  }

  get_page_margin(event: any) {
    if (event?.name == 'page_margin_left') {
      this.page_margin[0] = parseInt(event.value);
    } else if (event?.name == 'page_margin_top') {
      this.page_margin[1] = parseInt(event.value);
    } else if (event?.name == 'page_margin_right') {
      this.page_margin[2] = parseInt(event.value);
    } else if (event?.name == 'page_margin_bottom') {
      this.page_margin[3] = parseInt(event.value);
    }
  }

  inputCode(event: any) {
    if (event?.name == 'code') {
      this.params = event.value;
    } else if (event?.name == 'fonts') {
      this.code_options['font'] = event.value;
    } else if (event?.name == 'textTop') {
      this.textTop = event.value;
      this.svg.documentElement.querySelector('#top-text')?.remove();
      this.new_svg = this.overLayTextOnSvg(
        this.svg,
        this.textTop,
        this.code_options
      );
      return;
    } else if (parseInt(event.value)) {
      this.code_options[event.name] = parseInt(event.value);
    } else {
      this.code_options[event.name] = event.value;
    }
    if (event?.name || typeof event === 'string') {
      this.authservice
        .getBar(this.params, this.code_options, 0)
        .subscribe((data: any) => {
          const parser = new DOMParser();
          this.svg = parser.parseFromString(data, 'image/svg+xml');
          this.new_svg = this.overLayTextOnSvg(
            this.svg,
            this.textTop,
            this.code_options
          );
        });
    }
    this.router.navigate(['/auth/reports/'], {
      queryParams: {
        code: this.params,
        textTop: this.textTop,
        options: JSON.stringify(this.code_options),
      },
    });
  }
  generateCodes(code: any) {
    this.router.navigate(['/auth/reports/details'], {
      queryParams: {
        startcode: code.value.startcode,
        endcode: code.value.endcode,
        copies: code.value.truncate,
        topstartcode: code.value.topstartcode,
        topendcode: code.value.topendcode,
        // col: Math.round(code.value.cols),
        page_margin: this.page_margin,
        barcodesInSheet: this.barcodesInSheet,
        rowsInaSheet: this.barcodesInSheet / this.barCodeInaRow,
        col: this.barCodeInaRow,
        options: JSON.stringify(this.code_options),
      },
    });
  }

  isCopiesChange(event: any) {
    console.log(event.value);
    if (parseInt(event?.value) > 1) {
      this.isCopies = true;
    } else {
      this.isCopies = false;
    }
  }

  overLayTextOnSvg(svg: any, text: string, opts: any) {
    const {
      font,
      fontSize,
      fontOptions,
      letterSpacing,
      textAlign,
      marginRight,
    } = opts;

    let gElement = svg.querySelector('g');
    let x, y, align;

    const textElement = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'text'
    );
    if (gElement) {
      svg.documentElement.appendChild(gElement);
      let svgWidth = svg.documentElement.getAttribute('width')?.split('px')[0];
      let XTranslate = gElement
        .getAttribute('transform')
        .split('(')[1]
        .split(')')[0]
        .split(',')[0];
      if (svgWidth && textAlign === 'center') {
        x = parseInt(svgWidth) / 2 - parseInt(XTranslate);
        align = 'middle';
      }

      if (svgWidth && textAlign === 'left') {
        x = 0;
        align = 'start';
      }
      if (svgWidth && textAlign === 'right') {
        console.log('marginRight', marginRight, ' Xtranslate', XTranslate);
        x = parseInt(svgWidth) - (parseInt(XTranslate) + parseInt(marginRight));

        align = 'end';
      }
      textElement.setAttribute('x', `${x}`);
      textElement.setAttribute('y', `-5`);
      textElement.setAttribute('text-anchor', `${align}`);
      textElement.setAttribute('id', 'top-text');
      textElement.setAttribute(
        'style',
        `font:${fontOptions} ${fontSize}px ${font}; letter-spacing: ${
          letterSpacing === 1 ? 'normal' : letterSpacing
        }px;`
      );
      textElement.appendChild(document.createTextNode(text));
      gElement.appendChild(textElement);
      const updatedSvgString = new XMLSerializer().serializeToString(svg);
      let objectURL = 'data:image/svg+xml;base64,' + btoa(updatedSvgString);
      return this.sanitizer.bypassSecurityTrustUrl(objectURL);
    }
    return;
  }

  get_layout(width: any): any {
    console.log(width.value);
    if (width?.value == 'A4') {
      console.log(this.paper_size.A4);
      this.barCodeInaRow = Math.floor(this.paper_size.A4[0] / this.width);
      const rows = Math.floor(this.paper_size.A4[1] / this.height);
      this.barcodesInSheet = this.barCodeInaRow * rows;
    }
    if (width?.value == 'A3') {
      console.log(this.paper_size.A3);
      this.barCodeInaRow = Math.floor(this.paper_size.A3[0] / this.width);
      const rows = Math.floor(this.paper_size.A3[1] / this.height);
      this.barcodesInSheet = this.barCodeInaRow * rows;
    }
    if (width?.value == 'A5') {
      console.log(this.paper_size.A5);
      this.barCodeInaRow = Math.floor(this.paper_size.A5[0] / this.width);
      const rows = Math.floor(this.paper_size.A5[1] / this.height);
      this.barcodesInSheet = this.barCodeInaRow * rows;
    }
    if (width?.value == 'Letter') {
      console.log(this.paper_size.Letter);
      this.barCodeInaRow = Math.floor(this.paper_size.Letter[0] / this.width);
      const rows = Math.floor(this.paper_size.Letter[1] / this.height);
      this.barcodesInSheet = this.barCodeInaRow * rows;
    }
    if (width?.value == 'Legal') {
      console.log(this.paper_size.Legal);
      this.barCodeInaRow = Math.floor(this.paper_size.Legal[0] / this.width);
      const rows = Math.floor(this.paper_size.Legal[1] / this.height);
      this.barcodesInSheet = this.barCodeInaRow * rows;
    }
    if (width?.value == 'Executive') {
      console.log(this.paper_size.Executive);
      this.barCodeInaRow = Math.floor(
        this.paper_size.Executive[0] / this.width
      );
      const rows = Math.floor(this.paper_size.Executive[1] / this.height);
      this.barcodesInSheet = this.barCodeInaRow * rows;
    }
    if (width?.value == 'JIS B4') {
      console.log(this.paper_size['JIS B4']);
      this.barCodeInaRow = Math.floor(
        this.paper_size['JIS B4'][0] / this.width
      );
      const rows = Math.floor(this.paper_size['JIS B4'][1] / this.height);
      this.barcodesInSheet = this.barCodeInaRow * rows;
    }
    if (width?.value == 'JIS B5') {
      console.log(this.paper_size['JIS B5']);
      this.barCodeInaRow = Math.floor(
        this.paper_size['JIS B5'][0] / this.width
      );
      const rows = Math.floor(this.paper_size['JIS B5'][1] / this.height);
      this.barcodesInSheet = this.barCodeInaRow * rows;
    }
    if (width?.value == 'Tabloid') {
      console.log(this.paper_size.Tabloid);
      this.barCodeInaRow = Math.floor(this.paper_size.Tabloid[0] / this.width);
      const rows = Math.floor(this.paper_size.Tabloid[1] / this.height);
      this.barcodesInSheet = this.barCodeInaRow * rows;
    }
    if (width?.value == 'Statement') {
      console.log(this.paper_size.Statement);
      this.barCodeInaRow = Math.floor(
        this.paper_size.Statement[0] / this.width
      );
      const rows = Math.floor(this.paper_size.Statement[1] / this.height);
      this.barcodesInSheet = this.barCodeInaRow * rows;
    }
  }
}
