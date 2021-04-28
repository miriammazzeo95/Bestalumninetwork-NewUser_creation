# NewUser_creation
The scripts registers new members' data in the Admin Directory weather a new user fill the 'Become a member of BAN' form.

This script is a BETA version used for testing and correcting bugs in the code in production. It is embedded within a spreadsheet and triggered by filling a form. 
For easier testing an UNITTEST function has been implemented and a simplified form as well.

#SPREADSHEET: https://docs.google.com/spreadsheets/d/1yFZGMtlNRdiBq-RB3HjGA8BZfvj5bb9YhtcnJ_H5gbg/edit#gid=187297085
#FORM: https://docs.google.com/forms/d/1as1NO7PXmlMAUe4Yvz0KzVzSpNnxfh3XZPjlmYi7emI/edit

When a new user/applicant completes the form, this JS will:

1- check if this is the first application for this email address -> if not, step 2:3 are skipped

2- automatically "generates" a best alumni address as <name>.<family name>@bestalumni.net, 'Latinizing' the name and family name entered by users with the following functions: 
• ASCIIfolder removes diacritics (dots, accents, superscripts, subscripts..) and transliterates letters not present in the standard english alphabets (Turkish, Islandic, Danish, German...);
• latinizeCyrillic transliterates Cyrillic to latin alphabet;
• latinizeGreek transliterates Greek to latin alphabet.

3- assigns to the new user the group to be activated and a random password

3- insert the new user/applicant data in the database (Admin Directory), including LBG info (feature not working)

4- inform admin of the process with a summary email

@param {Object} e The event parameter for form submission to a spreadsheet; see https://developers.google.com/apps-script/understanding_events
