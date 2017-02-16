import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { DataService } from './data.service';
import { Member } from './member';

@Component({
    moduleId: module.id,
    selector: 'member-search',
    templateUrl: './member-search.component.html',
    styleUrls: ['./member-search.component.css'],
})

export class MemberSearchComponent implements OnInit {
    members: Member[];

    constructor(
        private dataService : DataService,
        private router: Router
    ) {}

    search(term: string): void {
        if(term.length==0) this.members=null;
        else this.dataService.search(term).then(members => this.members=members);
    }

    ngOnInit(): void {

    }

    gotoDetail(member: Member): void {
        let link = ['/detail_member', member.address];
        this.router.navigate(link);
    }
}