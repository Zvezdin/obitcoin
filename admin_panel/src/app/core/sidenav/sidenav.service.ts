import { Injectable } from '@angular/core';
import { SidenavItem } from "../sidenav-item/sidenav-item.model";
import { BehaviorSubject, Observable } from "rxjs";
import * as _ from 'lodash';

@Injectable()
export class SidenavService {

  private _itemsSubject: BehaviorSubject<SidenavItem[]> = new BehaviorSubject<SidenavItem[]>([]);
  private _items: SidenavItem[] = [ ];
  items$: Observable<SidenavItem[]> = this._itemsSubject.asObservable();

  private _currentlyOpenSubject: BehaviorSubject<SidenavItem[]> = new BehaviorSubject<SidenavItem[]>([]);
  private _currentlyOpen: SidenavItem[] = [ ];
  currentlyOpen$: Observable<SidenavItem[]> = this._currentlyOpenSubject.asObservable();

  isIconSidenav: boolean;

  constructor() {
    let menu = this;

    let dashboard = menu.addItem('My balance', 'dashboard', '/dashboard', 1);

    menu.addItem('Members', 'people', '/members', 1);
    menu.addItem('Pools', 'message', '/pools', 1);
    menu.addItem('Transactions', 'link', '/transactions', 1);

   /*let components =  menu.addItem('Components', 'layers', null, 3);
    menu.addSubItem(components, 'Buttons', '/components/buttons', 1);
    menu.addSubItem(components, 'Cards', '/components/cards', 2);
    menu.addSubItem(components, 'Dialogs', '/components/dialogs', 3);
    menu.addSubItem(components, 'Grid List', '/components/grid-list', 4);
    menu.addSubItem(components, 'Lists', '/components/lists', 5);
    menu.addSubItem(components, 'Menu', '/components/menu', 6);
    menu.addSubItem(components, 'Slider', '/components/slider', 7);
    menu.addSubItem(components, 'Snack-Bar', '/components/snack-bar', 8);
    menu.addSubItem(components, 'Tooltips', '/components/tooltips', 8);

    let forms = menu.addItem('Forms', 'insert_comment', null, 4);
    menu.addSubItem(forms, 'Form Elements', '/forms/form-elements', 1);
    menu.addSubItem(forms, 'Form Wizard', '/forms/form-wizard', 1);

    let tables =  menu.addItem('Tables', 'format_line_spacing', null, 5);
    menu.addSubItem(tables, 'Simple Table', '/tables/simple-table', 1);
    menu.addSubItem(tables, 'Fixed Header Table', '/tables/fixed-header-table', 2);

    let icons = menu.addItem('Material Icons', 'grade', '/icons', 7);

    let customPages = menu.addItem('Custom Pages', 'web', null, 8);
    menu.addSubItem(customPages, 'Login Page', '/login', 1);
    menu.addSubItem(customPages, 'Register Page', '/register', 2);
    menu.addSubItem(customPages, 'Forgot Password', '/forgot-password', 3);
    menu.addSubItem(customPages, 'Dashboard v1', '/dashboard-v1', 4);*/
  }

  addItem(name: string, icon: string, route: string, position: number, badge?: string, badgeColor?: string) {
    let item = new SidenavItem({
      name: name,
      icon: icon,
      route: route,
      subItems: [ ],
      position: position || 99,
      badge: badge || null,
      badgeColor: badgeColor || null
    });

    this._items.push(item);
    this._itemsSubject.next(this._items);

    return item;
  }

  addSubItem(parent: SidenavItem, name: string, route: string, position: number) {
    let item = new SidenavItem({
      name: name,
      route: route,
      parent: parent,
      subItems: [ ],
      position: position || 99
    });

    parent.subItems.push(item);
    this._itemsSubject.next(this._items);

    return item;
  }

  removeItem(item: SidenavItem) {
    let index = this._items.indexOf(item);
    if (index > -1) {
      this._items.splice(index, 1);
    }

    this._itemsSubject.next(this._items);
  }

  isOpen(item: SidenavItem) {
    return (this._currentlyOpen.indexOf(item) != -1);
  }

  toggleCurrentlyOpen(item: SidenavItem) {
    let currentlyOpen = this._currentlyOpen;

    if (this.isOpen(item)) {
      if (currentlyOpen.length > 1) {
        currentlyOpen.length = this._currentlyOpen.indexOf(item);
      } else {
        currentlyOpen = [ ];
      }
    } else {
      currentlyOpen = this.getAllParents(item);
    }

    this._currentlyOpen = currentlyOpen;
    this._currentlyOpenSubject.next(currentlyOpen);
  }

  getAllParents(item: SidenavItem, currentlyOpen: SidenavItem[] = [ ]) {
    currentlyOpen.unshift( item );

    if (item.hasParent()) {
      return this.getAllParents(item.parent, currentlyOpen);
    } else {
      return currentlyOpen;
    }
  }

  nextCurrentlyOpen(currentlyOpen: SidenavItem[]) {
    this._currentlyOpen = currentlyOpen;
    this._currentlyOpenSubject.next(currentlyOpen);
  }

  nextCurrentlyOpenByRoute(route: string) {
    let currentlyOpen = [ ];

    let item = this.findByRouteRecursive(route, this._items);

    if (item && item.hasParent()) {
      currentlyOpen = this.getAllParents(item);
    } else if (item) {
      currentlyOpen = [item];
    }

    this.nextCurrentlyOpen(currentlyOpen);
  }

  findByRouteRecursive(route: String, collection: SidenavItem[]) {
    let result = _.find(collection, { 'route': route });

    if (!result) {
      _.each(collection, (item) => {
        if (item.hasSubItems()) {
          let found = this.findByRouteRecursive(route, item.subItems);

          if (found) {
            result = found;
            return false;
          }
        }
      });
    }

    return result;
  }

  get currentlyOpen() {
    return this._currentlyOpen;
  }

}
