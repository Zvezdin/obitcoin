import { Member } from './member';

export class Pool{
    id: number;
    name: string;
    legalContract: string;
    financialReports: string;
    members: Member[];
    tokens: Map<string, number>;
    slices: Map<string, number>;
    totalTokens: number;
    totalSlices: number;

    init(){
        this.totalSlices=0;
		this.totalTokens=0;
		this.members.forEach(member =>{
			if(this.slices[member.address]!=undefined)
				this.totalSlices+=this.slices[member.address];
			if(this.tokens[member.address]!=undefined)
				this.totalTokens+=this.tokens[member.address]
		});
		console.log("Total slices for pool "+this.name+" - "+this.totalSlices+" and tokens - "+this.totalTokens);
    }
}