import { Member } from './member';

export class Pool{
    id: number;
    name: string;
    legalContract: string;
    financialReports: string;
    members: number[];
    tokens: Map<number, number>;
    slices: Map<number, number>;
    money: Map<number, number>;
    totalTokens: number;
    totalSlices: number;
    totalMoney: number;

    init(){
        this.totalSlices=0;
		this.totalTokens=0;
        this.totalMoney=0;
		this.members.forEach(member =>{
			if(this.slices[member]!=undefined)
				this.totalSlices+=this.slices[member];
			if(this.tokens[member]!=undefined)
				this.totalTokens+=this.tokens[member];
            if(this.money[member]!=undefined)
				this.totalMoney+=this.money[member]
		});
		console.log("Balance for pool "+this.name+" - "+this.totalSlices+" slices, "+this.totalTokens+" tokens and "+this.totalMoney+" money uints");
    }
}