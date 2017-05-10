pragma solidity ^0.4.9;

library MembersLib {
    enum PermLevel { none, member, admin, owner } //permission levels of contract members
    
    struct Member { //the struct of a contract (and cooperative) member
	    bytes32 name; //maximum name length = 32 bytes. This is to avoid dynamic string, which is resource heavy.
	    PermLevel permLevel; //current permission level. Can be changed to everything but owner.
	    bool exists; //used to check if this struct is initialized
	    address adr; //current address of the person. Can be changed.
	}
    //Each contract member has an ID of type uint16
}