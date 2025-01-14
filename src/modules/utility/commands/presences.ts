import { CommandInteraction } from "discord.js";
import { pmdDB } from "../../../database/client";
import UniformEmbed from "../../../util/UniformEmbed";

const presencesColl = pmdDB.collection("presences");

module.exports.run = async (interaction: CommandInteraction) => {
	if (!interaction.options.data) {
		let msgReply = await interaction.channel.send(
			`${interaction.member.toString()}, please specify the \`search\` or \`usage\` argument.`
		);
		return setTimeout(() => msgReply.delete(), 1 * 1000);
	}

	if (interaction.options.data.length === 2) {
		let msgReply = await interaction.channel.send(
			`${interaction.member.toString()}, please specify only one argument.`
		);

		return setTimeout(() => msgReply.delete(), 1 * 1000);
	}

	if ((interaction.options.data[0].value as string).trim().length === 0) {
		let msgReply = await interaction.channel.send(
			`${interaction.member.toString()}, please specify a search query.`
		);
		return setTimeout(() => msgReply.delete(), 1 * 1000);
	}

	if (interaction.options.data[0].name == "search") {
		return await interaction.channel.send({
			content: interaction.member.toString(),
			embeds: [
				await searchPresence(interaction.options.data[0].value as string)
			]
		});
	}
};

async function searchPresence(query: string) {
	let presences = await presencesColl
		.find(
			{
				$or: [
					{
						"metadata.service": { $regex: query, $options: "i" }
					},
					{
						"metadata.url": { $regex: query, $options: "i" }
					},
					{
						"metadata.tags": { $regex: query, $options: "i" }
					},
					{
						"metadata.altnames": { $regex: query, $options: "i" }
					},
					{
						"metadata.category": { $regex: query, $options: "i" }
					}
				]
			},
			{ projection: { _id: false, metadata: true } }
		)
		.limit(5)
		.toArray();

	let descriptionFunsies = "";
	for (const result of presences) {
		descriptionFunsies += `**[${
			result.metadata.service
		}](https://premid.app/store/presences/${encodeURIComponent(
			result.metadata.service
		)} "Click here to go to the store page for ${
			result.metadata.service
		}!")** by [${result.metadata.author.name}](https://premid.app/users/${
			result.metadata.author.id
		} "Click here to go to the profile page for ${
			result.metadata.author.name
		}!")`;
		descriptionFunsies += "\n_";
		let description = result.metadata.description.en;
		if (description.length > 100)
			description = description.substr(0, 100) + "...";
		descriptionFunsies += description;
		descriptionFunsies += "_\n\n";
	}

	return presences.length > 0
		? new UniformEmbed(
				{
					thumbnail: {
						height: 50,
						width: 50,
						url: presences[0].metadata.logo
					},
					description: `**Query:** \`${query}\`\n\n` + descriptionFunsies
				},
				`:mag_right: Presences • Search`,
				presences[0].metadata.color
		  )
		: new UniformEmbed(
				{
					description: "No Results for '" + query + "'"
				},
				":mag_right: Presences • Error",
				"#ff5050"
		  );
}

module.exports.config = {
	name: "presences",
	discordCommand: true
};
