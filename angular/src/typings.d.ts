/* SystemJS module definition */
declare var module: NodeModule;
declare module 'pdfmake/build/pdfmake.js';
declare module 'pdfmake/build/vfs_fonts.js';
declare module 'html-to-pdfmak';
declare module 'lodash';
interface NodeModule {
  id: string;
}
