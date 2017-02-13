import { Injectable } from '@angular/core';

import { Member } from './member';
import { MEMBERS } from './mock-members';

@Injectable()

export class MemberService {
	getMembers(): Promise<Member[]> {
		return Promise.resolve(MEMBERS);
	}
	
	getMembersSlowly(): Promise<Member[]> {
		return new Promise(resolve => {
			setTimeout(() => resolve(this.getMembers()), 2000);
		});
	}
	
	getMember(address: string): Promise<Member> {
		return this.getMembers()
			.then(members => members.find(member => member.address === address));
	}

	search(term: string): Promise<Member[]> {
		return this.getMembers()
			.then(members => members.filter(member => member.name.includes(term)));
	}
}