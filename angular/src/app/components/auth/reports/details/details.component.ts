import { AuthService } from './../../../auth.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import {
  Component,
  OnInit,
  Injectable,
  ViewChild,
  ElementRef,
} from '@angular/core';
// import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
var htmlToPdfmake = require('html-to-pdfmake');
import { Options } from '@angular-slider/ngx-slider';
import { ThrowStmt } from '@angular/compiler';
import { ReportsComponent } from '../reports.component';
import { DomSanitizer } from '@angular/platform-browser';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Injectable()
@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
  providers: [ReportsComponent],
})
export class DetailsComponent implements OnInit {
  ReportRowData: any;
  isSales: any;
  isGenerate = false;
  @ViewChild('pdfTable') pdfTable!: ElementRef<any>;
  cols_list: any;
  code_options: any;
  startcode: any;
  endcode: any;
  topstartcode: any;
  topendcode: any;
  isCopies: boolean = false;
  svg_list: any;
  rows_columns_list: any;
  truncate: any;
  copies: any;
  columns: any;
  docDef: any;
  pdfList: any;
  barcodesInSheet: number = 0;
  rowsInaSheet: number = 0;
  page_margin = [];
  pdfRowColumn: any;
  pageSize: any;

  public downloadAsPDF() {
    // const doc = new jsPDF();

    setTimeout(() => {
      const pdfTable = this.pdfTable.nativeElement;

      if (!pdfTable) {
        console.error('PDF table is not available.');
        return;
      }

      var html = htmlToPdfmake(pdfTable.innerHTML);

      var svgDefinition = {
        content: [
          html,
          {
            svg: '<svg width="300" height="200" viewBox="0 0 300 200">...</svg>',
          },
        ],
      };
      pdfMake.createPdf(svgDefinition).download('barcodes.pdf');
    }, 2000);
  }
  constructor(
    public authservice: AuthService,
    public sanitizer: DomSanitizer,
    public reports: ReportsComponent,
    private router: Router,
    public route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.columns = 4;

    this.route.queryParams.subscribe((params: Params) => {
      console.log({ params });
      this.code_options = JSON.parse(params['options']);
      this.reports.code_options = JSON.parse(params['options']);
      this.startcode = params['startcode'];
      this.endcode = params['endcode'];
      this.topstartcode = params['topstartcode'];
      this.topendcode = params['topendcode'];
      this.copies = params['copies'];
      this.columns = params['col'];
      this.isGenerate = true;
      this.page_margin = params['page_margin'];
      this.barcodesInSheet = parseInt(params['barcodesInSheet']);
      this.rowsInaSheet = parseInt(params['rowsInaSheet']);
      this.pageSize = params['pageSize'];
      this.generateCodes();
    });
  }

  ngAfterViewInit() {
    // Ensure pdfTable is available after the view has initialized
    if (this.pdfTable) {
      console.log(this.pdfTable.nativeElement); // Check if the element is available
      // this.downloadAsPDF();
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
      let svgHeight = svg.documentElement
        .getAttribute('height')
        ?.split('px')[0];

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
      return {
        objectURL: this.sanitizer.bypassSecurityTrustUrl(objectURL),
        updatedSvgString: updatedSvgString,
        svgHeight: parseInt(svgHeight),
        svgWidth: parseInt(svgWidth),
      };
    }
    return {
      objectURL: null,
      updatedSvgString: '',
      svgHeight: 0,
      svgWidth: 0,
    };
  }

  generateCodes() {
    var copies = parseInt(this.copies);
    var code_list = this.get_series(this.startcode, this.endcode, copies);
    var item_list = this.get_series(this.topstartcode, this.topendcode, copies);
    this.code_options['cols'] = this.columns;
    this.authservice.getBar(code_list, this.code_options, 0).subscribe(
      (data: any) => {
        this.svg_list = [];
        this.rows_columns_list = [];
        this.pdfList = [];
        const [_top, _left, _right, _bottom] = this.page_margin.map((margin) =>
          parseInt(margin)
        );
        const top = parseInt(this.page_margin[1]) * 2.835;
        const left = parseInt(this.page_margin[0]) * 2.835;
        const right = parseInt(this.page_margin[2]) * 2.835;
        const bottom = parseInt(this.page_margin[3]) * 2.835;
        console.log({ pageSize: this.pageSize });
        this.docDef = {
          content: [],
          pageSize: this.pageSize,
          pageMargins: [left, top, right, bottom],
        };

        for (let i = 0; i < data.length; i++) {
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(data[i], 'image/svg+xml');

          let { objectURL, updatedSvgString } = this.overLayTextOnSvg(
            svgDoc,
            item_list[i],
            {
              ...this.code_options,
            }
          );

          this.svg_list.push(objectURL);
          this.pdfList.push(updatedSvgString);
        }

        this.rows_columns_list = this.create_2D_array(
          this.svg_list,
          parseInt(this.columns)
        );
        this.pdfRowColumn = this.create_2D_array(
          this.pdfList,
          parseInt(this.columns)
        );

        var cols = [];
        for (const row of this.pdfRowColumn) {
          cols = [];
          for (const svg of row) {
            const width_in_pixels =
              parseInt(this.code_options['barcodeWidth']) * 2.835; // Convert mm to points in pdfmake
            const height_in_pixels =
              parseInt(this.code_options['barcodeHeight']) * 2.835; // Convert mm to points in pdfmake

            cols.push({
              svg: svg,
              width: width_in_pixels,
              height: height_in_pixels,
            });
          }
          this.docDef.content.push({
            columns: cols,
            margin: [0, 0, 0, 0],
            alignment: 'left',
          });
        }
        // pdfMake.createPdf(this.docDef).download('barcodes.pdf');
        pdfMake.createPdf(this.docDef).print();

        // this.router.navigate(['/auth/reports/details'],{queryParams: {startcode: this.startcode,endcode:this.endcode,truncate: this.truncate,options: JSON.stringify(this.code_options),col:this.columns}});
      },
      (error) => {
        console.log(error);
        if (error.status == 500) {
          alert('Something went wrong. Try again');
          // this.flashmessage.show("Something went wrong. Try again", {cssClass: 'alert-danger', timeout: 3000});
        } else if (
          JSON.parse(error._body).name == 'JsonWebTokenError' ||
          JSON.parse(error._body).name == 'TokenExpiredError'
        ) {
          localStorage.clear();
          this.router.navigate(['/auth/login']);
          alert('Session Expired. Login to continue');
          // this.flashmessage.show("Session Expired. Login to continue", {cssClass: 'alert-danger', timeout: 3000});
        }
      }
    );
  }

  create_2D_array(onedarray: string | any[], columns: number) {
    var twodarray = [];
    var rows = Math.round(onedarray.length / columns);

    var init = 0;
    var offset = columns;
    for (let i = 0; i < onedarray.length; i++) {
      if (i % columns == 0) {
        twodarray.push(onedarray.slice(init, offset));
        init = offset;
        offset = init + columns;
      } else {
        continue;
      }
    }

    return twodarray;
  }

  parse_name_number(code: string | any[]) {
    var name = this.splice_digits(code);
    return [name[1], name[0]];
  }

  get_series(start_code: any, end_code: any, copies: number) {
    var code_list = [];
    if (copies === 1) {
      var start = this.splice_digits(start_code);
      var end = this.splice_digits(end_code);
      var start_number = start[0];
      var end_number = end[0];

      if (start[1] == end[1]) {
        if (parseInt(start_number) < parseInt(end_number)) {
          const count = parseInt(end_number) - parseInt(start_number);
          for (let i = 0; i <= count; i++) {
            code_list.push(this.iterate_board_name(start_code, i));
          }
        }
      } else {
        this.router.navigate(['/auth/reports/']);
        alert('Invalid series');
      }
    } else {
      for (let i = 0; i < copies; i++) {
        code_list.push(start_code);
      }
    }
    return code_list;
  }

  splice_special_characters(full_name: string) {
    var split_hypen = full_name.split('-');
    var rebuilt_name = [];
    for (const [i, _] of split_hypen.entries()) {
      if (_.includes('_')) {
        var data = _.split('_');
        for (const [i, _] of data.entries()) {
          rebuilt_name.push(_);
        }
      } else {
        // console.log(_)
        rebuilt_name.push(_);
      }
    }
    var name = '';
    for (const [i, _] of rebuilt_name.entries()) {
      name = name + _;
    }

    return name;
  }

  splice_digits(full_name: string | any[]) {
    var name = '';
    var number = '';

    for (let i = 0; i < full_name.length; i++) {
      // console.log(full_name[i])
      if (parseInt(full_name[i])) {
        number = number + full_name[i];
      } else if (parseInt(full_name[i]) == 0) {
        number = number + full_name[i];
      } else {
        name = name + full_name[i];
      }
    }
    var list = [number, name];
    return list;
  }

  find_indexes(full_name: string | any[]) {
    var indexes_list = [];
    for (let i = 0; i < full_name.length; i++) {
      if (full_name[i] == '-') {
        indexes_list.push(['-', i]);
      } else if (full_name[i] == '_') {
        indexes_list.push(['_', i]);
      }

      if (parseInt(full_name[i])) {
        indexes_list.push([full_name[i], i]);
      } else if (parseInt(full_name[i]) == 0) {
        indexes_list.push([full_name[i], i]);
      }
    }

    return indexes_list;
  }

  rebuild_original(board_name: String, idx: any[]) {
    var rebuilt_name = board_name;
    for (const [_, item] of idx.entries()) {
      rebuilt_name =
        rebuilt_name.slice(0, parseInt(item[1])) +
        String(item[0]) +
        rebuilt_name.slice(parseInt(item[1]));
    }

    return rebuilt_name;
  }

  mutate_idx(old_idx: any[], new_idx: any[]) {
    var j = 0;
    for (const [i, item] of old_idx.entries()) {
      const key = old_idx[i][0];
      try {
        if (parseInt(key)) {
          old_idx[i][0] = new_idx[j][0];
          j += 1;
        } else if (parseInt(key) == 0) {
          old_idx[i][0] = new_idx[j][0];
          j += 1;
        }
      } catch {
        continue;
      }
    }

    return old_idx;
  }

  iterate_board_name(full_name: any, increment: number) {
    var no_sp_char = this.splice_special_characters(full_name);
    var name = this.splice_digits(no_sp_char);
    var board_number = name[0];
    var board_name = name[1];
    var to_number = parseInt(board_number) + increment;
    var string_len = board_number.length;
    var number_len = String(to_number).length;
    var new_to_number = String(to_number);
    if (number_len != string_len) {
      var zeroes_to_add = string_len - number_len;
      var zeroes_text = '';
      for (let i = 0; i < zeroes_to_add; i++) {
        zeroes_text = '0' + zeroes_text;
      }

      new_to_number = zeroes_text + String(to_number);
    }

    board_number = new_to_number;
    name = this.splice_digits(board_name + board_number);
    board_name = name[1];
    board_number = name[0];
    var old_idx = this.find_indexes(full_name);
    var new_idx = this.find_indexes(board_name + board_number);
    var idx = this.mutate_idx(old_idx, new_idx);
    var rebuilt_name = this.rebuild_original(board_name, idx);

    return rebuilt_name;
  }
}
