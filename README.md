# GSS SFDC filters manager

This tool helps managing and labelling inbound emails from GSS SFDC.

![GSS SFDC Filters manager screenshot](img/GSSSFDC-filters.png)

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

| Selector Name | Match if ... |
|:-------------:|:-------------------:|
| Product       | ... the email header `X-SFDC-X-Product` is the same of the defined value |
| Case          | ... the email header `X-SFDC-X-Case-Number` is the same of the defined value |
| Severity      | ... the email header `X-SFDC-X-Severity` contains the defined value |
| TAM Case      | ... the email header `X-SFDC-X-TAM-Case` is `true` |
| Internal status | ... the email header `X-SFDC-X-Internal-Status` is the same of the defined value |
| Status        | ... the email header `X-SFDC-X-Status` is the same of the defined value |
| Owner         | ... the email header `X-SFDC-Owner` contains the defined value |
| Contributor   | ... the email header `X-SFDC-Contributor` contains the defined value |
| SBR           | ... the email header `X-SFDC-X-SBR-Group` is the same of the defined value |
| Subject       | ... the email subject contains the defined value |
| Regex         | ... the email matches with the defined regex |
| First day     | ... the filter is evaluated during or after the defined date (hint: double click on the cell to have a date picker) |
| Last day      | ... the filter is evaluated during or before the defined date (hint: double click on the cell to have a date picker) |

**NOTE:** First and Last day are compared against the script execution time, not the email delivery time

## Links

- [Google apps script reference](https://developers.google.com/apps-script/reference)
- [clasp](https://github.com/google/clasp)
