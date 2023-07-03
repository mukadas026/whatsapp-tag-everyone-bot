const { Client, LocalAuth } = require("whatsapp-web.js")
const qrcode = require("qrcode-terminal")
console.log("initializing")
const client = new Client({
	authStrategy: new LocalAuth(),
	takeoverOnConflict: true,
})

client.on("qr", (qr) => {
	console.log("qring")
	qrcode.generate(qr, { small: true })
	console.log("qred")
})

client.on("ready", () => {
	console.log("server is running")
})

client.on("message_create", async (message) => {
	// Return if a message is not an actual chat but a status
	if (message.from === "status@broadcast") return

	// Get the chat the message belongs to and return if it is not a group chat
	const chat = await message.getChat()
	if (!chat.isGroup) return

	console.log("Group chat:", chat.name)

	let result = ""

	// check if a participant of the group prompts the bot with "/everyone"
	if (!(message.body === "/everyone")) return
	// Get a list of members in the group chat
	const participants = await chat.participants
	let partic = {}

	// check if the sender is an Admin
	for (const participant of participants) {
		if (!(participant.id._serialized === message._data.id.participant)) continue
		partic = participant
		break
	}
	if (!partic.isAdmin) return
	let contacts = []
	// get the contact details of each participant
	for (const participant of participants) {
		const contact = await client.getContactById(participant.id._serialized)
		// excluding the bot itself
		const botContact = await message.getContact()
		// const botNumber = botContact.number
		// console.log(botContact)
		// if (contact.id.user === botContact.id.user) continue
		console.log("started everyone", contacts)
		contacts.push(contact)
		result += `@${contact.name} `
	}
	// send message to group chat and mention everyone
	chat.sendStateTyping()
	chat.sendMessage("", { mentions: contacts, sendSeen: false })
	// chat.sendMessage(result)

	chat.clearState()
})

client.initialize()
