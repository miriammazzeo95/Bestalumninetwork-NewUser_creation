/**
 * Generate random new ID to be used on the Members Spreadsheet
 * Compare to the already exisiting IDs to ensure uniqueness
 */
function generateID(){

  Logger.log("GENAREATING ID...")
  const numOfDigits = 3;
  const alphabets = "ABCDEFGHIJKLMNPQRSTUVWXYZ"; //left O, its confusing when mixed with numbers.
  let idNum = Math.round(Math.random()*Math.pow(10,numOfDigits)).toString();
  if(idNum.length<3) return generateID(); 
  let newID = "";
  for(let i=0; i<numOfDigits;i++){
    newID += idNum[i] + alphabets[Math.floor((Math.random() * 24) + 1)];
   }
   Logger.log("GENERATED ID :"+newID);
  if(!isIDUnique(newID))
    return newID;
  else 
    return generateID();
}
/**
 * Compare to the already exisiting IDs to those in Memberlist to ensure uniqueness
 * @param newID: String, id to be checked.
 * returns false if Id is unique.
 */
function isIDUnique(newID){
  Logger.log("CHECKING ID UNIQUENESS...")
  const membersSpreadSheetId ="1oc3GR89Mw5E78re_er_BXK7KWncrJX9oo4VxYVRCB6M"
  const dataRange = "'List of members'!A2:A";
  // let columnIDs =SpreadsheetApp.openById(membersSpreadSheetId).getSheetByName("Become a Member").getRange(dataRange);
  let columnIDs = Sheets.Spreadsheets.Values.get(membersSpreadSheetId, dataRange).values; 
  let membersIDs = columnIDs? columnIDs.map((row)=> row[0].toString()) : [];
  Logger.log(membersIDs);
  numOfItemsInMemberList = membersIDs.length; //lazy method,avoiding to read the spreadsheet again 
  console.log("ID Unique status:", membersIDs.includes(newID));
  return membersIDs.includes(newID);
}