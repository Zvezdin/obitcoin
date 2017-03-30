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
	delegations: Delegation[];

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
		this.delegations = [];

		this.votes.forEach(vote => {
			vote.generateSuggestion(this.members);
		});



		this.pools.forEach(pool => {
			let d : Delegation = new Delegation();
			d.pool = pool;
			this.delegations.push(d);
			this.dataService.getPoolMembers(pool).then(members => {
				(pool as any).memberObjects = members.filter(member => member.id != this.user.id);
				if(pool.delegations[this.user.id] != 0) d.member = members.find(member => member.id == pool.delegations[this.user.id]);
			});
		});
	}

	getPool(id: number): Pool {
		return this.pools.find(pool => pool.id == id);
	}

	delegate(delegation: Delegation){
		if(delegation == undefined || delegation.pool == undefined) return;
		if(delegation.member != null && (delegation.pool.delegations[this.user.id] == delegation.member.id || delegation.member.id == this.user.id) ) return; //user cannot delegate if he already has, or cannot delegate to himself

		this.dataService.delegateVote(delegation.pool.id, delegation.member == undefined ? 0 : delegation.member.id, function(result){
			console.log("Successful delegation!");
		});
	}
	

	submitVote(vote: Vote, voteFor: boolean): void {
		console.log("Voing for ", vote, " and status ", voteFor);

		var self = this;
		
		this.dataService.vote(vote.id, voteFor, function(result){
			if(result!=undefined){
				console.log("Successful vote");
			}
		});
	}
}

class Delegation {
	member: Member;
	pool: Pool;
}
