import { Component, OnInit } from '@angular/core';
import { Member } from '../member';
import { Pool } from '../pool';
import { Vote } from '../vote';
import { DataService } from '../data.service';

@Component({
	selector: 'ms-voting',
	templateUrl: './voting.component.html',
	styleUrls: ['./voting.component.scss']
})
export class VotingComponent implements OnInit {
	votes : Vote[];
	members: Member[];
	pools: Pool[];
	user: Member;
	userPools: Pool[];

	constructor(private dataService: DataService) { }
	
	ngOnInit() {
		this.dataService.getVotes().then(votes => {
			this.votes = votes;
			this.dataService.getMembers().then(members => {
				this.members = members;
				this.dataService.getPools().then(pools => {
					this.pools = pools;

					this.dataService.getUserPools().then(userPools => {
						this.userPools = userPools;
						
						this.dataService.getUser().then(user => {
							this.user = user;

							this.initData();
						});
					});
				});
			});
		});
	}

	initData(): void{
		this.votes.forEach(vote => {
			vote.generateSuggestion(this.members);
		});
	}
	
}
