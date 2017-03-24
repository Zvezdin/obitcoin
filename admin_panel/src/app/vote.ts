export class Vote{
    voteType: number;
    pool: number;
    arg1: number[];
    arg2: number[];
    startedBy: number;
    voteState: number;
    endTime: number;
    votedFor: number;
    votedAgainst: number;

    voted : Map<number, boolean>;
}