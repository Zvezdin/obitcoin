import { EventEmitter, ViewContainerRef, TemplateRef, OnInit, AfterContentInit, QueryList } from '@angular/core';
export declare class Header {
}
export declare class Footer {
}
export declare class PrimeTemplate {
    template: TemplateRef<any>;
    type: string;
    name: string;
    constructor(template: TemplateRef<any>);
    getType(): string;
}
export declare class TemplateWrapper implements OnInit {
    viewContainer: ViewContainerRef;
    item: any;
    index: number;
    templateRef: TemplateRef<any>;
    constructor(viewContainer: ViewContainerRef);
    ngOnInit(): void;
}
export declare class Column implements AfterContentInit {
    field: string;
    sortField: string;
    header: string;
    footer: string;
    sortable: any;
    editable: boolean;
    filter: boolean;
    filterMatchMode: string;
    rowspan: number;
    colspan: number;
    style: any;
    styleClass: string;
    hidden: boolean;
    expander: boolean;
    selectionMode: string;
    filterPlaceholder: string;
    frozen: boolean;
    sortFunction: EventEmitter<any>;
    templates: QueryList<any>;
    template: TemplateRef<any>;
    headerTemplate: TemplateRef<any>;
    bodyTemplate: TemplateRef<any>;
    footerTemplate: TemplateRef<any>;
    filterTemplate: TemplateRef<any>;
    editorTemplate: TemplateRef<any>;
    ngAfterContentInit(): void;
}
export declare class Row {
    columns: QueryList<Column>;
}
export declare class HeaderColumnGroup {
    rows: QueryList<any>;
}
export declare class FooterColumnGroup {
    rows: QueryList<any>;
}
export declare class ColumnBodyTemplateLoader {
    viewContainer: ViewContainerRef;
    column: any;
    rowData: any;
    rowIndex: number;
    constructor(viewContainer: ViewContainerRef);
    ngOnInit(): void;
}
export declare class ColumnHeaderTemplateLoader {
    viewContainer: ViewContainerRef;
    column: any;
    constructor(viewContainer: ViewContainerRef);
    ngOnInit(): void;
}
export declare class ColumnFooterTemplateLoader {
    viewContainer: ViewContainerRef;
    column: any;
    constructor(viewContainer: ViewContainerRef);
    ngOnInit(): void;
}
export declare class ColumnFilterTemplateLoader {
    viewContainer: ViewContainerRef;
    column: any;
    constructor(viewContainer: ViewContainerRef);
    ngOnInit(): void;
}
export declare class ColumnEditorTemplateLoader {
    viewContainer: ViewContainerRef;
    column: any;
    rowData: any;
    constructor(viewContainer: ViewContainerRef);
    ngOnInit(): void;
}
export declare class TemplateLoader {
    viewContainer: ViewContainerRef;
    template: TemplateRef<any>;
    data: any;
    constructor(viewContainer: ViewContainerRef);
    ngOnInit(): void;
}
export declare class SharedModule {
}
