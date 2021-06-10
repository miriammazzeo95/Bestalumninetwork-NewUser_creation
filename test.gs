var sheet = SpreadsheetApp.getActiveSheet();
function myFunction() {
  sheet.getRange('W'+2).setValues([['bla']]);
  sheet.getRange('X'+2).setValues([['New']]);
}

/**PAYMENTS_SPREADSHEET_ID = "1ZXW1VVfuDFviyQh4jR1qaHwbt1t3ZxUOU56N4o7i4-4";
function getPaymentInfo(spreadSheetId = '1ZXW1VVfuDFviyQh4jR1qaHwbt1t3ZxUOU56N4o7i4-4',sheetName="Payments", cellRange='A55:E55' ){
  var range= SpreadsheetApp.openById(spreadSheetId).getSheetByName(sheetName).getRange(cellRange);
  return range.getValues()
}*/

function testuser(){
  var user = AdminDirectory.Users.get('tsepang.motsie@bestalumni.net');

  //let userID = user.customerId;
  // user.password=Math.random().toString(36);

  Logger.log(user.externalIds)
  // user.externalIds = '4321';
  // AdminDirectory.Users.patch(user,"tsepang.motsie@bestalumni.net");
  Logger.log(user.id)
  Logger.log(user.customSchemas)
  
}

function isarrey(){
  //Get current location of the submission in the google sheet (in order to put comment and read history)
  var sheet = SpreadsheetApp.getActiveSheet();
  var email = 'miriam.mazzeo@best-eu.org';
  // Step 1, check for redundancy
  // TODO check redundancy in directory instead
  let allEmails = sheet.getRange("B1:B").getValues();
  let redundantRowIndex = allEmails.findIndex((redundantRow) => redundantRow == email); //Search for row with same email in second column
  Logger.log(redundantRowIndex)
}


function testIDs(){
var dataRange = "'List of members'!A2:A"; // <SHEET_NAME>!<RANGE_START>:<RANGE_END>
  const membersSpreadSheetId = '1oc3GR89Mw5E78re_er_BXK7KWncrJX9oo4VxYVRCB6M';
  var generatedIds = Sheets.Spreadsheets.Values.get(membersSpreadSheetId, dataRange).values;
  Logger.log('ids '+generatedIds);
  let userID = generatedIds[generatedIds.length]+1;
  Logger.log(generatedIds);
  Logger.log(generatedIds.length);
  Logger.log("UserID: "+typeof generatedIds[0]);
  Logger.log("UserID: "+[Number(generatedIds[generatedIds.length-1])+1]);
}

function aaaa(){
    const membersSpreadSheetId = '1oc3GR89Mw5E78re_er_BXK7KWncrJX9oo4VxYVRCB6M'; // members spreadsheet
    var dataRange = "'List of members'!A2:A"; // <SHEET_NAME>!<RANGE_START>:<RANGE_END>
    var generatedIds = Sheets.Spreadsheets.Values.get(membersSpreadSheetId, dataRange).values;
    Logger.log('ids '+generatedIds);
    let userID = String([Number(generatedIds[generatedIds.length-1])+1][0]);
    Logger.log(userID);
}

function todelete(){
  user=AdminDirectory.Users.get('aatest1.2405@bestalumni.net')
  Logger.log(user.externalIds[0].value)
}


