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
    delegations: Map<number, number>;
    totalTokens: number;
    totalSlices: number;
    totalMoney: number;

    init(){
        let totalMoney : number = 0, totalTokens : number = 0, totalSlices : number = 0;
		this.members.forEach(member =>{
			if(this.slices[member]!=undefined)
				totalSlices+=this.slices[member];
			if(this.tokens[member]!=undefined)
				totalTokens+=this.tokens[member];
            if(this.money[member]!=undefined)
				totalMoney+=this.money[member]
		});

        if(this.totalSlices != totalSlices || this.totalMoney != totalMoney || this.totalTokens != totalTokens) console.error("Error! Total balance count mismatch at pool", this);

		console.log("Balance for pool "+this.name+" - "+totalSlices+" slices, "+totalTokens+" tokens and "+totalMoney+" money uints");
    }
}