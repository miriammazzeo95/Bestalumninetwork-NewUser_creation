/**
 *   This form is filled by any applicant to BAN
 * At completion of the form,this will:
 * 1- check if this is the first application for this email address -> if not, step 2 is skipped
 * 2- insert the person given the form data in the database (directory), including 
    * a_ an automatically "calculated" best alumni address
    * b_ in the group to be activated 
    * c_ with a random password 
 * 3- inform admin of the process
 * @param {Object} e The event parameter for form submission to a spreadsheet;
 *     see https://developers.google.com/apps-script/understanding_events
 */

var A0ORGUNIT = "/A0 - Members to be verified"; //TODO: change after testing
//var A0ORGUNIT =  "/T1 - Test OU";
//var ADMIN_ML = 'admin@bestalumni.net';
var ADMIN_ML = 'miriam.mazzeo@bestalumni.net'; //TODO: change this before testing

function unittest() {
  var test_obj_v1 = {
    namedValues: {
      'Surname': ['2405'],
      'Address - Street': [ 'testing street' ],
      'Address - ZIP/Postal Code': ['2800'],
      'Address - City': ['Cph'],
      'Address - Country': ['dk'],
      Timestamp: [ '06/10/2020 21:00:40' ],
      'Phone number with country code': [ '010101' ],
      'First name': [ 'test2' ],
      'Email': [ 'testPasswordAttribute@gmail.com' ]
    },

     range: {
      rowEnd: 12,
      columnEnd: 8.0
    }
  };
  onFormSubmit(test_obj_v1, true)
}


function onFormSubmit(e, unittest = false) {
  console.log(e);

  var LOGGING_PREFIX = '[onFormSubmit] \t';
  try{
    //Get the input data in var
    var responses = e.namedValues;
    var firstName = responses['First name'][0].trim();
    var familyName = responses['Surname'][0].trim();
    var email = responses['Email'][0].trim(); 
    var adressStr = responses['Address - Street'][0];
    var adressZIP = responses['Address - ZIP/Postal Code'][0];
    var adressCity = responses['Address - City'][0];
    var adressCountry = responses['Address - Country'][0];
    var adress = adressStr.concat("\n", adressZIP," ", adressCity,"\n", adressCountry);
    var phoneNr = responses['Phone number with country code'][0].trim();
    //TODO Get the LBG of the applicant, add it directly to the user, and adapt the email sent to admin referring to "add manually the LBG"
    var currentRow = unittest? e.range.rowEnd : e.range.getRow();
    //Get current location of the submission in the google sheet (in order to put comment and read history)
    var sheet = SpreadsheetApp.getActiveSheet();

    
    // Step 1, check for redundancy
    // TODO ASK if we need to check that redundancy email is present in Members deactivated

    let allEmails = sheet.getRange(1,2,currentRow-1).getValues();

    //Search for row in second column matching new member's personal email
    let redundantRowIndex = allEmails.findIndex((redundantRowIndex) => redundantRowIndex[0] == email); 
   
    /* 
    var i = parseInt(currentRow - 1);
    // TODO Improve the comparison here below because it is taking ~0.1s per comparison, thus 300 lines -> 30s 
    while (sheet.getRange(i, 2).getValues() != email && i > 1)  { // "2" is the second column, the one where we get the email address of the applicant
      // Logger.log(LOGGING_PREFIX + 'inputrow going from: ' + i.toString() + ' to ' + (i - 1).toString());
      i = i - 1;
    }
    */
    if (redundantRowIndex !=-1 & redundantRowIndex){
      //TODO: check if the user is deactivated user, and in case it is BREAK
      //Logger.log(LOGGING_PREFIX+ 'Went through the submission sheet for checking duplicates and stopped at line ' + redundantRowIndex+1);
      Logger.log(LOGGING_PREFIX+ 'Entry redundant with row %s thus ignored', redundantRowIndex+1);
      sendWarningtoAdmin(email + " - redundant with row " + redundantRowIndex+1); // Step 3, inform admin
    }
    else {
      // No duplicate found nothing happens so we can proceed to Step 2, adding user
    

      var tempPwd = createPassword(); //temporary pwd generated randomly e.g "Rilivi-Xakega"
      var banEmailAddress = addUser(firstName,familyName,email,adress,phoneNr, tempPwd, unittest); // Step 3, inform admin within the add user method
        
      sheet.getRange('W'+currentRow).setValues([[banEmailAddress]]);
      sheet.getRange('X'+currentRow).setValues([['New']]);
      sheet.getRange('Y'+currentRow).setValues([[tempPwd]]);//TODO remove later on
    }
  
 
  } catch(err) {
    sendFailtoAdmin(err.message);
    // TODO give error for 'already in use' personal email
    console.log(LOGGING_PREFIX+'Logged error: ' + err.message); // Step 3, inform admin
  }
}
//TODO ask what we do if someone applies again after years, maybe check in directory instead for redundancy  

/**
 * Adds a new user to the domain, within Org Unit "/A0 - Members to be verified" including only the information stated in parameters. For
 * the full list of user fields, see the API's reference documentation:
 * @see https://developers.google.com/admin-sdk/directory/v1/reference/users/insert
 */
function addUser(firstNameParam, familyNameParam, personalEmailAddressParam, completeAddressParam, phoneNrParam, tempPwd, unittest) {
  var firstName = firstNameParam;
  var familyName = familyNameParam;
  var personalEmailAddress = personalEmailAddressParam;
  var completeAddress = completeAddressParam;
  var phoneNr= phoneNrParam;

//START NEW PART - TRANSLITERATION AND DIACRITICS REMOVAL
  //DICRITICS REMOVAL
  var firstNameCleanedUp = ASCIIFolder.foldReplacing(firstName.toLowerCase()).replace(/[^a-z0-9]/g, '') // REMOVE INVALID CHARS;
  var familyNameCleanedUp = ASCIIFolder.foldReplacing(familyName.toLowerCase()).replace(/[^a-z0-9]/g, '') // REMOVE INVALID CHARS;
  var rforeign = /[^\u0000-\u007f]/;


  //TRANSLITERATION OF CYRILLIC OR GREEK INTO LATIN ALPHABET
  if (!firstNameCleanedUp || firstNameCleanedUp==' '){
    var firstNameCleanedUp = latinizeCyrillic(firstName)
    if (rforeign.test(firstNameCleanedUp)){
    var firstNameCleanedUp = latinizeGreek(firstName)
    }
  }

  if (!familyNameCleanedUp || familyNameCleanedUp==' '){
    var familyNameCleanedUp = latinizeCyrillic(familyName)
    if (rforeign.test(familyNameCleanedUp)){
      var familyNameCleanedUp = latinizeGreek(familyName)
    }
  }

  var firstNameCleanedUp = firstNameCleanedUp.replace(/[^a-z0-9]/g, '') // REMOVE INVALID CHARS;
  var familyNameCleanedUp = familyNameCleanedUp.replace(/[^a-z0-9]/g, ''); // REMOVE INVALID CHARS

  var banEmailAddress = firstNameCleanedUp +"."+familyNameCleanedUp +"@bestalumni.net";

//END NEW PART

  var banEmailCleanedUp = banEmailAddress;
  var personalEmailCleanedUp = personalEmailAddress;

  
  //TODO: add LBG information to user
  var user = {
    "primaryEmail": banEmailCleanedUp,
    "name": {
      "givenName": firstName,
      "familyName": familyName,
      "fullName": firstName + " " + familyName
    },
    "isAdmin": false,
    "isDelegatedAdmin": false,
    "agreedToTerms": true,
    "suspended": false,
    "archived": false,
    "changePasswordAtNextLogin": true,
    "emails": [
      {
        "address": personalEmailCleanedUp,
        "type": "home"
      },
      {
        "address": banEmailCleanedUp,
        "primary": true
      }
    ],
    "addresses": [
      {
        "type": "home",
        "formatted": completeAddress
      }
    ],
    "organizations": [
      {
        "title": "Member",
        "primary": true,
        "customType": "",
        "description": "Volunteer"
      }
    ],
    "phones": [
      {
        "value": phoneNr,
        "type": "mobile"
      }
    ],
    "orgUnitPath": A0ORGUNIT,
    "includeInGlobalAddressList": true,
    "recoveryEmail": personalEmailCleanedUp,
    password: tempPwd
  };

  console.log('Trying to create user with ban email `%s`', banEmailCleanedUp);
  user = AdminDirectory.Users.insert(user);

  //ASSIGN TEMPORARY PASSWORD TO USER ATTRIBUTE - randomly generated 
  //user = AdminDirectory.Users.get(banEmailCleanedUp)
  //user.password =tempPwd;
  
  Logger.log(LOGGING_PREFIX+ 'User registered with password '+user.password);
  Logger.log(LOGGING_PREFIX+ 'User %s created with ID %s.', user.primaryEmail, user.id);
  sendMessagetoAdmin(personalEmailAddress + `- password: ${tempPwd}`,banEmailCleanedUp);
 
  return banEmailCleanedUp
}


const SPREADSHEET_BECOMEBANMEMBER = 'https://docs.google.com/spreadsheets/d/1VDfiNwjq2fNWMp7PqT1jGxnC67otNtBXwp2mBKX2-Sk/edit#gid=365308082';
const SCRIPT_BECOMEBANMEMBER_EXECUTIONS = 'https://script.google.com/home/projects/1PFhc-9k2OkDvGvpC_uoXKi6kgMeohV0-CSBbCr-g08ZVBr0F_7jVPWZB/executions';


function sendMessagetoAdmin(userEmailandInfo, banEmailCleanedUp) {
  
  //TODO: UPDATE LINKS AND VARIABLES
  MailApp.sendEmail({
    to: ADMIN_ML,
    subject: 'New application registered',
    htmlBody: 'Please see the status of the new application of ' + userEmailandInfo +' - in '+ SPREADSHEET_BECOMEBANMEMBER +'. \n Logs can be found in '+ SCRIPT_BECOMEBANMEMBER_EXECUTIONS +'. \n Please note that currently LBG is NOT automatically saved to the directory. This will have to added manually. Automatically generated BAN email address: ' + banEmailCleanedUp,
    });

}

function sendWarningtoAdmin(userEmailandInfo) {
  
  //TODO: UPDATE LINKS AND VARIABLES

  MailApp.sendEmail({
    to: ADMIN_ML,
    subject: 'DUPLICATE - New application NOT registered',
    htmlBody: 'Please see the status of the new application of ' + userEmailandInfo +' - in '+ SPREADSHEET_BECOMEBANMEMBER +'. \n Logs can be found in '+ SCRIPT_BECOMEBANMEMBER_EXECUTIONS +'. \n Please note that nothing has been updated in the directory. You will have to update it manually.',
  });

} 

function sendFailtoAdmin(errmessage) {
  
  //TODO: UPDATE LINKS AND VARIABLES

  MailApp.sendEmail({
      to: ADMIN_ML,
      subject: 'FAIL - New application NOT registered',
    htmlBody: 'Please check the status of the logs in '+ SCRIPT_BECOMEBANMEMBER_EXECUTIONS +'. \n Something went wrong: ' + errmessage,
    });

}

