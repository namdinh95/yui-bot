'use strict';

const Discord = require('discord.js');
const client = new Discord.Client();
const jsonFileIO = require('jsonfile');
const commandListFile = './commandList.json'; 
const manual = "```css\n" +
  "`help: Display this message\n" +
  "`add <command> <content>: Add a new command\n" +
  "`del <command>: Delete a command\n" + 
  "`list: List all custom commands\n" + 
  "```";
const announcementID = process.env.ANNOUNCEMENT_ID;

const prefix = '`';
// Load the command list from disk
var commandList = jsonFileIO.readFileSync(commandListFile);

client.on('ready', () => {
  console.log("I'm ready!");
});

client.on('message', msg => {
  // Skip if message is bot
  if (msg.author.bot) return;

  // Non-command functions
  if (!msg.content.startsWith(prefix)) {
    let lmao = ayylmao(msg);
    if (lmao.valid) 
      msg.channel.sendMessage('lma' + 'o'.repeat(lmao.length));
  }
  // Command functions
  else {
    // Display help message
    if (msg.content.startsWith(prefix + 'help')) 
      msg.channel.sendMessage(manual);
    // List all custom commands
    if (msg.content.startsWith(prefix + 'list'))
      listUpdatedCommands();
    // Add manual commands
    if (msg.content.startsWith(prefix + 'add')) {
      // Slice to peel off command
      let [newCommand, ...replyArray] = msg.content.split(' ').slice(1); 
      let replyMessage = replyArray.join(' ');
      commandList[newCommand] = replyMessage; // Update the list of commands
      msg.channel.sendMessage(`Added ${msg.author.username}'s new command`);
      listUpdatedCommands();
    }
    // Delete manual commands
    if (msg.content.startsWith(prefix + 'del')) {
      // Get the command to delete
      let commandToDel = msg.content.split(' ').slice(1);
      delete commandList[commandToDel];
      msg.channel.sendMessage('Deleted ' + commandToDel);
      listUpdatedCommands();
    }
    // Added commands functions
    else {
      let [commandWithPrefix] = msg.content.split(' ');
      let command = commandWithPrefix.slice(1);
      if (commandList[command]) 
        msg.channel.sendMessage(commandList[command]);
    }
  }

  function ayylmao(message) {
    const regex = /(^|\b)ay{2,}/gi; // only at start of sentence or word
    let lmao = {}; // result to return
    let result = regex.exec(message); // array of match info
    if (result === null) {
      return {
        valid: false
      };
    } 
    // There's a match here
    lmao.valid = true;
    lmao.length = result[0].length - 2; // exclude 'a' and one 'y'
    return lmao;
  }

  function listUpdatedCommands() {
    let message = "Here is the command list:\n```css\n";
    for (let command in commandList) {
      // Disregard inherited property from prototype
      if (commandList.hasOwnProperty(command)) 
        message += command + ': ' + commandList[command] + '\n';
    }
    message += "```";
    client.channels.get(announcementID).sendMessage(message);
  }
});

// Clean up code
client.on('disconnect', e => updateCommandList());
// Dev clean up code
// Begin reading from stdin so the process does not exit
process.stdin.resume();
process.on('SIGINT', () => {
  updateCommandList();
  process.exit();
});

client.login(process.env.TOKEN);


function updateCommandList() {
  jsonFileIO.writeFileSync(commandListFile, commandList);
  console.log('\nSuccessfully updated command list');
}
