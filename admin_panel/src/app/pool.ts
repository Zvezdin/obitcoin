import { Member } from './member';

export class Pool{
    id: number;
    name: string;
    legalContract: string;
    financialReports: string;
    members: number[];
    tokens: Map<number, number>;
    slices: Map<number, number>;
    totalTokens: number;
    totalSlices: number;

    init(){
        this.totalSlices=0;
		this.totalTokens=0;
		this.members.forEach(member =>{
			if(this.slices[member]!=undefined)
				this.totalSlices+=this.slices[member];
			if(this.tokens[member]!=undefined)
				this.totalTokens+=this.tokens[member]
		});
		console.log("Total slices for pool "+this.name+" - "+this.totalSlices+" and tokens - "+this.totalTokens);
    }
}