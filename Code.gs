/** @OnlyCurrentDoc */
/**
 * Installs a trigger on the Spreadsheet when a Form response is submitted.
 */
function installTrigger() {
  ScriptApp.newTrigger('onFormSubmit')
      .forSpreadsheet(SpreadsheetApp.getActive())
      .onFormSubmit()
      .create();
}



/**
 *   This form is for the BAN treasurer in order to input the payment done by a member into the database.
 * This will:
 * 1- find the user depending on the given bestaluni adress in the directory
 * 2- insert the date/fee paid by this user in the database
 * 3- add this information as well in his user information in the directory
 * 4- Put the user to active group (if applies) and inform the user by email that his fee was well received his/her account is active for next year
 * @param {Object} e The event parameter for form submission to a spreadsheet;
 *     see https://developers.google.com/apps-script/understanding_events
 */
//Greek: γΔδΕεΖ
//Iselandic: æÐðÞþ
//Danish: æøå
//German: ß, trasnslated to ss
//tested mεriam, ε gets deleted 
//Cyrillic: Мириам Мацео


function unittest() {
  var test_obj_v1 = {
    namedValues: {
      'Family Name': [ 'TestLBG' ],
      Address: [ 'test\ntest\n2eojofjg' ],
      Timestamp: [ '06/10/2020 21:00:40' ],
      'Phone number': [ '010101' ],
      'First Name': [ 'Miriam' ],
      Email: [ 'nofunnycharacters.allowed@gmail.com' ],
      Comments: [ '' ]
      //LBG: ['cph']
    }
  };
  onFormSubmit(test_obj_v1, true)
}

function onFormSubmit(e, unittest = false) {
  console.log(e);
  /** var username = {name: e.namedValues['First Name'][0], lastname: e.namedValues['Last Name'][0]};
  'var fee_paid = {fee: e.namedValues['Amount paid'][0], date: e.namedValues['Date of payment'][0]};
  Variables coming from the form itself
  */
  var responses = e.namedValues;
  var firstName = responses['First Name'][0].trim();
  var familyName = responses['Family Name'][0].trim();
  var email = responses['Email'][0].trim(); 
  var adress = responses['Address'][0];
  var phoneNr = responses['Phone number'][0].trim();
  //var lbg =  responses['LBG'][0].trim();
  //addUser(firstName,familyName,email,adress,phoneNr,lbg, unittest);
  addUser(firstName,familyName,email,adress,phoneNr, unittest);
}


/**
 * Adds a new user to the domain, within Org Unit "/A0 - Members to be verified" including only the information stated in parameters. For
 * the full list of user fields, see the API's reference documentation:
 * @see https://developers.google.com/admin-sdk/directory/v1/reference/users/insert
 */
function addUser(firstNameParam, familyNameParam, personalEmailAddressParam, completeAddressParam, phoneNrParam, unittest) {
  var a0OrgUnit = "/T1 - Test OU";
  var firstName = firstNameParam;
  var familyName = familyNameParam;
  var personalEmailAddress = personalEmailAddressParam;
  var completeAddress = completeAddressParam;
  var phoneNr= phoneNrParam;


//START NEW PART - TRANSLITERATION AND DIACRITICS REMOVAL
  var firstNameCleanedUp = ASCIIFolder.foldReplacing(firstName.toLowerCase()).replace(/[^a-z0-9]/g, '') // REMOVE INVALID CHARS;
  var familyNameCleanedUp = ASCIIFolder.foldReplacing(familyName.toLowerCase()).replace(/[^a-z0-9]/g, '') // REMOVE INVALID CHARS;
  var rforeign = /[^\u0000-\u007f]/;

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

  // TODO match to the real submit form (?)
  
  //var banEmailCleanedUp = banEmailAddress.replace(/[^a-zA-Z0-9_\-@.]/g,'');
  //var banEmailCleanedUp = banEmailAddress.replace(/[ş]/g,'s');
  var banEmailCleanedUp = banEmailAddress;

  //this works for diacritics but not used in the end
  //var banEmailCleanedUp = removeDiacritics(banEmailAddress); 

  var personalEmailCleanedUp = personalEmailAddress;
  
//TODO: add LBG information to user
  var user = {
    "primaryEmail": banEmailCleanedUp,
    "name": {
      "givenName": firstName,
      "familyName": familyName,
      "fullName": firstName + " " + familyName,
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
    //"LBG": 'cph',
    "phones": [
      {
        "value": phoneNr,
        "type": "mobile"
      }
    ],
    "orgUnitPath": a0OrgUnit,
    "includeInGlobalAddressList": true,
    "recoveryEmail": personalEmailCleanedUp,
    // Generate a random password string.
    password: Math.random().toString(36)
  };
  Logger.log('Trying to create user with ban email `%s`', banEmailCleanedUp);
  user = AdminDirectory.Users.insert(user);
  Logger.log('User %s created with ID %s.', user.primaryEmail, user.id);
}
