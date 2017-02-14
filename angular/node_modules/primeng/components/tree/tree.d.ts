import { AfterContentInit, EventEmitter, OnInit, ViewContainerRef, QueryList, TemplateRef } from '@angular/core';
import { TreeNode } from '../common/api';
export declare class TreeNodeTemplateLoader implements OnInit {
    viewContainer: ViewContainerRef;
    node: any;
    template: TemplateRef<any>;
    constructor(viewContainer: ViewContainerRef);
    ngOnInit(): void;
}
export declare class UITreeNode {
    tree: Tree;
    static ICON_CLASS: string;
    node: TreeNode;
    parentNode: TreeNode;
    root: boolean;
    firstChild: boolean;
    lastChild: boolean;
    constructor(tree: Tree);
    ngOnInit(): void;
    getIcon(): string;
    isLeaf(): boolean;
    toggle(event: Event): void;
    onNodeClick(event: MouseEvent): void;
    onNodeRightClick(event: MouseEvent): void;
    isSelected(): boolean;
}
export declare class Tree implements AfterContentInit {
    value: TreeNode[];
    selectionMode: string;
    selection: any;
    selectionChange: EventEmitter<any>;
    onNodeSelect: EventEmitter<any>;
    onNodeUnselect: EventEmitter<any>;
    onNodeExpand: EventEmitter<any>;
    onNodeCollapse: EventEmitter<any>;
    onNodeContextMenuSelect: EventEmitter<any>;
    style: any;
    styleClass: string;
    contextMenu: any;
    layout: string;
    templates: QueryList<any>;
    templateMap: any;
    readonly horizontal: boolean;
    ngAfterContentInit(): void;
    onNodeClick(event: MouseEvent, node: TreeNode): void;
    onNodeRightClick(event: MouseEvent, node: TreeNode): void;
    findIndexInSelection(node: TreeNode): number;
    propagateSelectionUp(node: TreeNode, select: boolean): void;
    propagateSelectionDown(node: TreeNode, select: boolean): void;
    isSelected(node: TreeNode): boolean;
    isSingleSelectionMode(): boolean;
    isMultipleSelectionMode(): boolean;
    isCheckboxSelectionMode(): boolean;
    getTemplateForNode(node: TreeNode): TemplateRef<any>;
}
export declare class TreeModule {
}
