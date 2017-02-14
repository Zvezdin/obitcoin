import { Member } from './member';

export class Pool{
    id: number;
    name: string;
    legalContract: string;
    financialReports: string;
    members: Member[];
    tokens: Map<string, number>;
    slices: Map<string, number>;
}