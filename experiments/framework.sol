pragma solidity ^0.4.9;

contract BonusPool{
    //CRUD User
    //CRUD Roles
    
    //Allow withdraw
    
    //Block/unblock
    
    //Delegate confirmation vote
    
    //Change voting rules (% of roles for each action separately)
    
    //CR Delta
    
    //CR Message
    
    //Suggest codebase
    
    //Vote for Delta & Message & Codebase
    
    //Events - state changed
    
    enum Operation {updateMember, updateRole, allowWithdraw, delegate, changeVotingRules,
    createDelta, createMessage, suggestCodebase}
    
    struct Member{
        bool exists;
        
        address adr;
        address delegation;
        
        uint16 role;
        bytes32 name;
    }
    uint16 memberCounter;
    
    mapping (uint16 => Member) public members;
    uint16[] memberIds;
    
    //uint16[] roleIds;
    
    struct Role{
        bool exists;
        //operation -> % consesnsus required
        mapping(uint16 => uint8) consensus;
    }
    uint16 roleCounter;
    
    mapping(address => uint16) memberAddresses;
    
    //for each operation, for each role, the % of needed consensus
    mapping(uint16 => mapping(uint16 => uint8)) votingRules;
    
    struct Vote{
        Operation operation;
        mapping(uint16 => bool) voted; //member -> voted or not yet
        mapping(uint16 => uint16) votes; //role -> number of votes
    }
    
    
    struct Delta{
        
    }
    uint deltaCounter;
    
    Delta[] deltas;
    
    uint currentState;
    
    function BonusPool(address[] masterkeys){
        memberCounter = 1;
    }
    
    //todo what if we add a member with an already existing delegated address?
    function updateMember(uint16 member, bytes32 name, address adr, address delegation, uint16 role) {
        if(member != 0 && !members[member].exists) throw;
        if(memberAddresses[adr] != member && memberAddresses[adr] != 0) throw; //can't add this person if the same address is already in the system.
        if(memberAddresses[delegation] != 0) throw; //cannot delegate voting rights 
        
        bool added = member == 0;
        
        if(added){ //add the member
            member = memberCounter++;
            memberIds.push(member);
        }
        
        if(members[member].adr != adr){
            memberAddresses[members[member].adr] = 0;
            memberAddresses[adr] = member;
        }
        
        members[member] = Member({name: name, adr: adr, delegation: delegation, role: role, exists: true});
    }
    
    
}