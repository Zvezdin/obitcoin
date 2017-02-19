import { Member } from './member';

export class Pool{
    id: number;
    name: string;
    legalContract: string;
    financialReports: string;
    members: Member[];
    tokens: Map<number, number>;
    slices: Map<number, number>;
    totalTokens: number;
    totalSlices: number;

    init(){
        this.totalSlices=0;
		this.totalTokens=0;
		this.members.forEach(member =>{
			if(this.slices[member.id]!=undefined)
				this.totalSlices+=this.slices[member.id];
			if(this.tokens[member.id]!=undefined)
				this.totalTokens+=this.tokens[member.id]
		});
		console.log("Total slices for pool "+this.name+" - "+this.totalSlices+" and tokens - "+this.totalTokens);
    }
}