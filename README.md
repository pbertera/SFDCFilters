# SFDCnotifier

This tool helps managing and labelling inbound emails from GSS SFDC.

## Installation

1. Copy the [Google Sheet](https://docs.google.com/spreadsheets/d/1b4HgisYEb_KZbVchKHwCWTw2WBwxFGXtWRAa8_FUz_Q/edit?usp=sharing) in your drive
2. Add your selectors and actions
3. Make sure that the **Main filter** into the **Config** sheet is properly set
4. To test the rules, make sure to have some email matching the rules and the **Main filter** and then run the script clicking on **GSS SFDC filters -> Run**, this will run the script only one time
5. To permanently install the script click on **GSS SFDC filters -> Install Trigger**, this will make the script running every X minutes defined into the **Poll time** cell of the **Config** sheet

## How it works

The scripts looks into all the email matching the **Main filter** criteria, per each message the filters into the **Filters sheet** are evaluated starting from the fist line.
In case an email matches the filter selector the filter actions are applied, if **Stop** column isn't flagged the email is evaluated against the next filter.

### Selectors

- **Product:** checks the email header `X-SFDC-X-Product`
- **Case:** checks the email header `X-SFDC-X-Case-Number`
- **Severity:** checks the email header `X-SFDC-X-Severity`
- **TAM Case:** checks the email header `X-SFDC-X-TAM-Case`
- **SBR:** checks the email header `X-SFDC-X-SBR-Group`
- **Subject:** checks the email subject
- **Regex:** checks the email against a regular expression
- **First Day:** enable the filter starting on the day defined here
- **Last Day:** enable the filter not after the day defined here

**NOTE:** First and Last day are compared against the script execution time, not the email delivery time

## Links

- [Google apps script reference](https://developers.google.com/apps-script/reference)
- [clasp](https://github.com/google/clasp)
