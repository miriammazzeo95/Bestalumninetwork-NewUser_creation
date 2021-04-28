# NewUser_creation


This script is embedded within a spreadsheet and connected triggered by filling a form. New users fill the form to apply for BAN membership.

#SPREADSHEET: https://docs.google.com/spreadsheets/d/17ZC44sx7U25cpTi7IJZkBi1gebIXOtfG9g1NH57LyCE/edit#gid=636585522
#FORM: https://docs.google.com/forms/d/e/1FAIpQLSfVU4jouxKIlBFLyRAJ4x2Ax8WG4GemXeB26fSvGjgz46gt5A/viewform

When a new user/applicant completes the form, this JS will:
   1- check if this is the first application for this email address -> if not, step 2 is skipped
   2- insert the new user/applicant data in the database (Admin Directory), including 
     a_ an automatically "calculated" best alumni address
     b_ the group to be activated 
     c_ a random password 
   3- inform admin of the process with a summary email
   
@param {Object} e The event parameter for form submission to a spreadsheet; see https://developers.google.com/apps-script/understanding_events
