/*
 *
 * "Pietro Bertera" <pbertera@redhat.com>
 *
 * This script was inspired by this post https://www.labnol.org/internet/advanced-gmail-filters/4875/
 *
 * TODO: 
 * - add action mark thread important / unimportant
 * - add action remove label from thread
 * - add selector: day of the week
 * - investigate how to refresh the gmail app wui (maybe https://developers.google.com/apps-script/reference/gmail/gmail-thread#refresh) ?
 */

// get settings from the "Config" sheet
var ss = SpreadsheetApp.getActiveSpreadsheet();
var mainFilter = ss.getRange("Config!A2").getValue();
var batchSize = ss.getRange("Config!B2").getValue();
var pollTime = ss.getRange("Config!C2").getValue();

Logger.log("Main Filter: " + mainFilter);
Logger.log("Batch size: " + batchSize);
Logger.log("Poll time: " + pollTime);

function removeTriggers() {
  var triggers = ScriptApp.getScriptTriggers();
  for(var i in triggers) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
}

function registerTrigger() {
  removeTriggers();
  ScriptApp.newTrigger('workOn')
  .timeBased()
  .everyMinutes(pollTime)
  .create();   
}

// show the help page
function help() {
  var html = HtmlService.createHtmlOutputFromFile('help')
  .setTitle("Gmail GSS SFDC filters")
  .setWidth(800)
  .setHeight(600);
  var ss = SpreadsheetApp.getActive();
  ss.show(html);
}

// create the menu
function onOpen() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var menu = [
    {name: "Help",functionName: "help"},
    {name: "Run", functionName: "workOn"},
    {name: "Install Trigger", functionName: "install"},
    {name: "Remove Trigger", functionName: "uninstall"}
  ];  
  ss.addMenu("GSS SFDC filters", menu);
}

function install() {  
  registerTrigger();
  SpreadsheetApp.getActiveSpreadsheet().toast("Fiters created, the spreadsheet is polled every " + pollTime + " minutes");
}

function uninstall() {
  removeTriggers(); 
  SpreadsheetApp.getActiveSpreadsheet().toast("Your Gmail filters has been removed.");
}

function readFilters() {
  // index representing the selectors column (column A is 0)
  var filterColumns = {
    'isActive': 0,
    'account': 1,
    'product': 2,
    'caseNumber': 3,
    'caseSeverity': 4,
    'TAMCase': 5,
    'internalStatus': 6,
    'status': 7,
    'owner': 8,
    'contributor': 9,
    'sbr': 10,
    'subject': 11,
    'regex': 12,
    'firstDay': 13,
    'lastDay': 14
  };

// index representing the action column (column A is 0)  
  var actionColumns = {
    'label': 15,
    'star': 16,
    'markRead': 17,
    'markUnread': 18,
    'trash': 19,
    'archive': 20,
    'stopProcessing': 21
  };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Filters');

  // This represents ALL the data
  var range = sheet.getDataRange();
  var values = range.getValues();
  var filters = [];

  // This logs the spreadsheet in CSV format with a trailing comma
  for (var rowNum = 2; rowNum < values.length; rowNum++) {
    var filter = {'id': rowNum + 1, 'selectors':{}, 'actions': {}}
    if(values[rowNum][filterColumns.isActive]){

      Logger.log("Filter " + filter['id'] + " is active");
      // SELCTORS
      
      if(values[rowNum][filterColumns.account] !==  ""){
        filter.selectors.account = values[rowNum][filterColumns.account];
      }
      if(values[rowNum][filterColumns.product] !==  ""){
        filter.selectors.product = values[rowNum][filterColumns.product];
      }
      if(values[rowNum][filterColumns.caseNumber] !==  ""){
        filter.selectors.caseNumber = values[rowNum][filterColumns.caseNumber];
      }
      if(values[rowNum][filterColumns.caseSeverity] !==  ""){
        filter.selectors.caseSeverity = values[rowNum][filterColumns.caseSeverity];
      }
      if(values[rowNum][filterColumns.TAMCase]){
        filter.selectors.TAMCase = true;
      }
      if(values[rowNum][filterColumns.internalStatus] !==  ""){
        filter.selectors.internalStatus = values[rowNum][filterColumns.internalStatus];
      }
      if(values[rowNum][filterColumns.status] !==  ""){
        filter.selectors.status = values[rowNum][filterColumns.status];
      }
      if(values[rowNum][filterColumns.owner] !==  ""){
        filter.selectors.owner = values[rowNum][filterColumns.owner];
      }
      if(values[rowNum][filterColumns.contributor] !==  ""){
        filter.selectors.contributor = values[rowNum][filterColumns.contributor];
      }
      if(values[rowNum][filterColumns.sbr] !==  ""){
        filter.selectors.sbr = values[rowNum][filterColumns.sbr];
      }
      if(values[rowNum][filterColumns.subject] !==  ""){
        filter.selectors.subject = values[rowNum][filterColumns.subject];
      }
      if(values[rowNum][filterColumns.regex] !==  ""){
        filter.selectors.regex = values[rowNum][filterColumns.regex];
      }
      if(values[rowNum][filterColumns.firstDay] !== "") {
        filter.selectors.firstDay = new Date(values[rowNum][filterColumns.firstDay]);
      }
      if(values[rowNum][filterColumns.lastDay] !== "") {
        filter.selectors.lastDay = new Date(values[rowNum][filterColumns.lastDay]);
      }
      
      // ACTIONS
      if(values[rowNum][actionColumns.label] !==  ""){
        filter.actions.label = values[rowNum][actionColumns.label];
      }
      if(values[rowNum][actionColumns.star]){
        filter.actions.star = values[rowNum][actionColumns.star];
      }
      if(values[rowNum][actionColumns.markRead]){
        filter.actions.markRead = values[rowNum][actionColumns.markRead];
      }
      if(values[rowNum][actionColumns.markUnread]){
        filter.actions.markUnread = values[rowNum][actionColumns.markUnread];
      }
      if(values[rowNum][actionColumns.trash]){
        filter.actions.trash = values[rowNum][actionColumns.trash];
      }
      if(values[rowNum][actionColumns.archive]){
        filter.actions.archive = values[rowNum][actionColumns.archive];
      }
      if(values[rowNum][actionColumns.stopProcessing]){
        filter.stopProcessing = values[rowNum][actionColumns.stopProcessing];
      }
      filters.push(filter);
    }
  }
  return filters;  
}

function workOn() {
  filters = readFilters();
  //Logger.log(filters);

  var dryrun = false;
  var labelCache = {};

  var threads = GmailApp.search(mainFilter, 0, batchSize);
  GmailApp.getMessagesForThreads(threads);

  var findOrCreateLabel = function(name) {
    if (labelCache[name] === undefined) {
      labelCache[name] = GmailApp.getUserLabelByName(name) || GmailApp.createLabel(name);
    }
    return labelCache[name];
  }

  var applyLabel = function(name, thread){
    var label = null;
    var labelName = "";

    // create nested labels by parsing "/"
    name.split('/').forEach(function(labelPart, i) {
      labelName = labelName + (i===0 ? "" : "/") + labelPart.trim();
      label = findOrCreateLabel(labelName);
    });
    thread.addLabel(label);
  }

  threads.forEach(function(thread) {
    var messages = thread.getMessages();
    if (messages == null) return; // nothing to do

    var subject = thread.getFirstMessageSubject()
    Logger.log("Processing mail thread " + subject);

    var message = messages[messages.length - 1]; // most recent message
    var body = message.getRawContent();

    function applyFilters(filter) {
      var today = new Date();
      // check if a regexp match against the full email body (TODO: case sensitivness ?)
      function isMatched(regexp) {
        var match = new RegExp(regexp);
        if (match.exec(body) == null) {
          return false;
        } else {
          return true;
        }
      }

      if (filter.selectors.subject) { // email subject selectors
        if (!isMatched('Subject:.*?' + filter.selectors.subject)) return false;
      }
      if (filter.selectors.account) { // SFDC account selectors
        if (!isMatched('X-SFDC-X-Account-Number: ' + filter.selectors.account)) return false;
      }
      if (filter.selectors.product) { // SFDC product selectors
        if (!isMatched('X-SFDC-X-Product: ' + filter.selectors.product)) return false;
      }
      if (filter.selectors.caseNumber) { // SFDC case number selectors
        if (!isMatched('X-SFDC-X-Case-Number: ' + filter.selectors.caseNumber)) return false;
      }
      if (filter.selectors.caseSeverity) { // SFDC case severity selectors
        if (!isMatched('X-SFDC-X-Severity: .*' + filter.selectors.caseSeverity + '.*')) return false;
      }
      if (filter.selectors.TAMCase) { // SFDC TAM case
        if (!isMatched('X-SFDC-X-TAM-Case: true')) return false;
      }
      if (filter.selectors.internalStatus) { // SFDC Internal status
        if (!isMatched('X-SFDC-X-Internal-Status: ' + filter.selectors.internalStatus)) return false;
      }
      if (filter.selectors.status) { // SFDC Status
        if (!isMatched('X-SFDC-X-Status: ' + filter.selectors.status)) return false;
      }
      if (filter.selectors.owner) { // SFDC owner
        if (!isMatched('X-SFDC-X-Owner: .*' + filter.selectors.owner + ".*")) return false;
      }
      if (filter.selectors.contributor) { // SFDC contributor
        if (!isMatched('X-SFDC-X-Contributors: .*' + filter.selectors.contributor + ".*")) return false;
      }
      if (filter.selectors.sbr) { // SFDC SBR group
        if (!isMatched('X-SFDC-X-SBR-Group: ' + filter.selectors.sbr)) return false;
      }
      if (filter.selectors.regex) { // regex selectors
        if (!isMatched(filter.selectors.regex)) return false;
      }
      if (filter.selectors.firstDay) {
        if (today < filter.selectors.firstDay) return false;
      }
      if (filter.selectors.lastDay) {
        if (today > filter.selectors.lastDay) return false;
      }

      Logger.log("filter " + filter.id + " matched");

      if (!dryrun) {
        if (filter.actions.label !== undefined) {
          applyLabel(filter.actions.label, thread);
          Logger.log("Applied label " + filter.actions.label);
        }
        if (filter.actions.star) {
          message.star();
          Logger.log("Starred message");
        }
        if (filter.actions.markRead) {
          message.markRead();
          Logger.log("Marked as read");
        }
        if (filter.actions.markUnread) {
          message.markUnread();
          Logger.log("Marked as unread");
        }
        if (filter.actions.trash) {
          message.moveToTrash();
          Logger.log("Modev to trash");
        }
        if (filter.actions.archive) {
          thread.moveToArchive();
          Logger.log("Thread archived");
        }
      }
      return true;
    }

    // walk over the filters and process them
    for (var i=0; i < filters.length; i++) {
      //Logger.log("Processing filter " +  filters[i].id);
      isMatched = applyFilters(filters[i]);
      // if filter.stopProcessing is true we don't process the next filter
      if (filters[i].stopProcessing && isMatched){
        Logger.log("Stop processing filters, Stop is flagged");
        break;
      }
    }
  });
}
