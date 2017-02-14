import { EventEmitter, QueryList } from '@angular/core';
import { TreeNode } from '../common/api';
import { Header, Footer, Column } from '../common/shared';
export declare class UITreeRow {
    treeTable: TreeTable;
    node: TreeNode;
    level: number;
    labelExpand: string;
    labelCollapse: string;
    constructor(treeTable: TreeTable);
    toggle(event: Event): void;
    isLeaf(): boolean;
    isSelected(): boolean;
    onRowClick(event: MouseEvent): void;
    resolveFieldData(data: any, field: string): any;
}
export declare class TreeTable {
    value: TreeNode[];
    selectionMode: string;
    selection: any;
    selectionChange: EventEmitter<any>;
    onNodeSelect: EventEmitter<any>;
    onNodeUnselect: EventEmitter<any>;
    onNodeExpand: EventEmitter<any>;
    onNodeCollapse: EventEmitter<any>;
    style: any;
    styleClass: string;
    labelExpand: string;
    labelCollapse: string;
    header: Header;
    footer: Footer;
    columns: QueryList<Column>;
    onRowClick(event: MouseEvent, node: TreeNode): void;
    findIndexInSelection(node: TreeNode): number;
    isSelected(node: TreeNode): boolean;
    isSingleSelectionMode(): boolean;
    isMultipleSelectionMode(): boolean;
    hasFooter(): boolean;
}
export declare class TreeTableModule {
}
