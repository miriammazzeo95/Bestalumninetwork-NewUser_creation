/** @OnlyCurrentDoc */

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

var A0ORGUNIT = "/A0 - Members to be verified";
var ADMIN_ML = 'admin@bestalumni.net';


function onFormSubmit(e, unittest = false) {
  console.log(e);
  try{
  //Get the input data in var
  var responses = e.namedValues;
  var firstName = responses['First name'][0].trim();
  var familyName = responses['Surname'][0].trim();
  var email = responses['E-Mail-Adresse'][0].trim(); 
  var adressStr = responses['Address - Street'][0];
  var adressZIP = responses['Address - ZIP/Postal Code'][0];
  var adressCity = responses['Address - City'][0];
  var adressCountry = responses['Address - Country'][0];
  var adress = adressStr.concat("\n", adressZIP," ", adressCity,"\n", adressCountry);
  var phoneNr = responses['Phone number with country code'][0].trim();
  //TODO Get the LBG of the applicant, add it directly to the user, and adapt the email sent to admin referring to "add manually the LBG"
  
  //Get current location of the submission in the google sheet (in order to put comment and read history)
  var sheet = SpreadsheetApp.getActiveSheet();
  var currentRow = parseInt(e.range.getRow());
  
  // Step 1, check for redundancy
  var i = parseInt(currentRow - 1); 
    // TODO Improve the comparison here below because it is taking ~0.1s per comparison, thus 300 lines -> 30s 
  while (sheet.getRange(i, 2).getValues() != email && i > 1)  { // "2" is the second column, the one where we get the email address of the applicant
     // Logger.log('inputrow going from: ' + i.toString() + ' to ' + (i - 1).toString());
    i = i - 1;
  }
    Logger.log('Went through the submission sheet for checking duplicates and stopped at line ' + i.toString());
    
  if (i == 1) {
    // No duplicate found nothing happens so we can proceed to
     // Step 2, adding user
    var tempPwd = Math.random().toString(36); //temporary pwd generated randomly
    addUser(firstName,familyName,email,adress,phoneNr, tempPwd, unittest); // Step 3, inform admin within the add user method
    
  } else {
    Logger.log('Entry redundant with row %s thus ignored', i);
    sendWarningtoAdmin(email + " - redundant with row " + i); // Step 3, inform admin
  }
 
  } catch(err) {
    sendFailtoAdmin(err.message);
    Logger.log('Logged error: ' + err.message); // Step 3, inform admin
  }
  
  
  
}


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
  var banEmailAddress = firstName.replace(/\s+/g, '-').toLowerCase() +"."+familyName.replace(/\s+/g, '-').toLowerCase() +"@bestalumni.net";
   //TODO improve to get é -> e, ä -> ae etc so that the best alumni address doesn't simply truncate the name of the people
  var banEmailCleanedUp = banEmailAddress.replace(/[^a-zA-Z0-9_\-@.]/g,'');
  
  var user = {
    "primaryEmail": banEmailAddress,
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
        "address": personalEmailAddress,
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
    "recoveryEmail": personalEmailAddress,
    password: tempPwd
  };
  Logger.log('Trying to create user with ban email `%s`', banEmailCleanedUp);
  user = AdminDirectory.Users.insert(user);
  Logger.log('User %s created with ID %s.', user.primaryEmail, user.id);
  sendMessagetoAdmin(personalEmailAddress + " - pwd: '" + tempPwd + "'",banEmailCleanedUp);
  
}


function sendMessagetoAdmin(userEmailandInfo, banEmailCleanedUp) {
  
  MailApp.sendEmail({
      to: ADMIN_ML,
      subject: 'New application registered',
    htmlBody: 'Please see the status of the new application of ' + userEmailandInfo +' - in https://docs.google.com/spreadsheets/d/17ZC44sx7U25cpTi7IJZkBi1gebIXOtfG9g1NH57LyCE/edit#gid=1197417993. \n Logs can be found in https://script.google.com/home/projects/11Ptf0kJTBqV31hrnAlNLfoPyqKvMqNUe80OiML4Gi5SQWoT0mkaPTHEf/executions. \n Please note that currently LBG is NOT automatically saved to the directory. You will have to add this manually. Automatically generated BAN email address: ' + banEmailCleanedUp,
    });

}

 function sendWarningtoAdmin(userEmailandInfo) {
  
  MailApp.sendEmail({
      to: ADMIN_ML,
      subject: 'DUPLICATE - New application NOT registered',
    htmlBody: 'Please see the status of the new application of ' + userEmailandInfo +' - in https://docs.google.com/spreadsheets/d/17ZC44sx7U25cpTi7IJZkBi1gebIXOtfG9g1NH57LyCE/edit#gid=1197417993. \n Logs can be found in https://script.google.com/home/projects/11Ptf0kJTBqV31hrnAlNLfoPyqKvMqNUe80OiML4Gi5SQWoT0mkaPTHEf/executions. \n Please note that nothing has been updated in the directory. You will have to update it manually.',
    });

} 
  function sendFailtoAdmin(errmessage) {
  
  MailApp.sendEmail({
      to: ADMIN_ML,
      subject: 'FAIL - New application NOT registered',
    htmlBody: 'Please check the status of the logs in https://script.google.com/home/projects/11Ptf0kJTBqV31hrnAlNLfoPyqKvMqNUe80OiML4Gi5SQWoT0mkaPTHEf/executions. \n Something went wrong: ' + errmessage,
    });

}

function unittest() {
  var test_obj_v1 = {
    namedValues: {
      'Surname': [ 'tâest S$4/üsaouter' ],
      'Address - Street': [ 'testing street' ],
      Timestamp: [ '06/10/2020 21:00:40' ],
      'Phone number with country code': [ '010101' ],
      'First Name': [ 'ivane&ß tesét' ],
      'E-Mail-Adresse': [ 'test@gmail.com' ]
    }
  };
  onFormSubmit(test_obj_v1, true)
}
