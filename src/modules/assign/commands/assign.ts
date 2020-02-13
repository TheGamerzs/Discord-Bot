import * as Discord from "discord.js";
import config from "../../../config";
import assignRolesFile from "../assignRoles";

let embed: Discord.MessageEmbed;

module.exports.run = async (
	message: Discord.Message,
	params: Array<String>
) => {
	let assignRoles: Discord.Role[] = Object.values(assignRolesFile)
		.map(r => message.guild.roles.cache.get(r))
		.filter(v => v != undefined);

	if (params.length == 0) {
		message.delete();
		embed = new Discord.MessageEmbed({
			title: "Assignable Roles",
			description: `*You can assign these roles by typing
			\`\`${config.prefix}assign <roleName>\`\`*

			${assignRoles.map(r => `**${r.name}**`).join(", ")}`,
			color: "#7289DA"
		});

		message.channel
			.send(embed)
			.then(msg => (msg as Discord.Message).delete({ timeout: 10 * 1000 }));
		return;
	}

	let assignRole = assignRoles.filter(
		r => r.name.toLowerCase() == params.join(" ").toLowerCase()
	);

	if (assignRole.length == 0) {
		embed = new Discord.MessageEmbed({
			title: "Assign",
			description: `Role **${params.join(" ")}** does not exist.`,
			color: "#ff5050"
		});
		message.channel
			.send(embed)
			.then(msg => (msg as Discord.Message).delete({ timeout: 10 * 1000 }));
		return;
	}

	let asRole = assignRole[0];

	if (message.member && message.member.roles.cache.has(asRole.id)) {
		message.react("❌");
		embed = new Discord.MessageEmbed({
			title: "Assign",
			description: `You already have the **${asRole.name}** role.`,
			color: "#ff5050"
		});

		message.channel.send(embed).then(msg => {
			message.delete({ timeout: 10 * 1000 });
			(msg as Discord.Message).delete({ timeout: 10 * 1000 });
		});
	} else {
		if (message.member) message.member.roles.add(asRole.id);
		message.react("✅");
		embed = new Discord.MessageEmbed({
			title: "Assign",
			description: `Assigned **${asRole.name}** role.`,
			color: "#50ff50"
		});

		message.channel.send(embed).then(msg => {
			message.delete({ timeout: 10 * 1000 });
			(msg as Discord.Message).delete({ timeout: 10 * 1000 });
		});
	}
};

module.exports.config = {
	name: "assign",
	description: "Assign yourself roles."
};
