const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
require('dotenv').config();

module.exports = {
    name: 'verification',
    description: 'Manage the verification system',
    category: 'ADMIN',
    userPermissions: ['ManageGuild'],
    slashCommand: {
        enabled: true,
        ephemeral: true,
        options: [
            {
                name: 'add',
                description: 'Set up the verification role',
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: 'role',
                        description: 'The role to be given',
                        type: ApplicationCommandOptionType.Role,
                        required: false,
                    },
                    {
                        name: 'role_id',
                        description: 'The role ID to be given',
                        type: ApplicationCommandOptionType.String,
                        required: false,
                    },
                ],
            },
            {
                name: 'remove',
                description: 'Remove the verification role',
                type: ApplicationCommandOptionType.Subcommand,
            },
            {
                name: 'panel',
                description: 'Create a verification panel',
                type: ApplicationCommandOptionType.Subcommand,
            },
        ],
    },

    async interactionRun(interaction, data) {
        const sub = interaction.options.getSubcommand();
        let response;

        if (sub === 'add') {
            let role = interaction.options.getRole('role');
            if (!role) {
                const role_id = interaction.options.getString('role_id');
                if (!role_id) return interaction.reply({ content: 'Please provide a role or role ID', ephemeral: true });

                role = interaction.guild.roles.cache.get(role_id);
                if (!role) return interaction.reply({ content: 'No matching roles found', ephemeral: true });
            }
            response = await setVerificationRole(interaction, role, data.settings);
        } else if (sub === 'remove') {
            response = await setVerificationRole(interaction, null, data.settings);
        } else if (sub === 'panel') {
            await createVerificationPanel(interaction);
            return;
        } else {
            response = 'Invalid subcommand';
        }

        await interaction.reply({ content: response, ephemeral: true });
    },
};

async function setVerificationRole({ guild }, role, settings) {
    if (role) {
        if (role.id === guild.roles.everyone.id) return 'You cannot set `@everyone` as the verification role';
        if (!guild.members.me.permissions.has('ManageRoles')) return 'I lack the `ManageRoles` permission';
        if (guild.members.me.roles.highest.position < role.position) return 'I lack permission to assign this role';
        if (role.managed) return 'This role is managed by an integration';
    }

    settings.verificationRole = role ? role.id : null;
    await settings.save();
    return `Verification role is ${role ? 'set' : 'removed'}`;
}

async function createVerificationPanel(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('Verification Required')
        .setDescription('Click the button below to verify yourself and gain access to the server.')
        .setColor(0x00ff00);

    const button = new ButtonBuilder()
        .setCustomId('verify_button')
        .setLabel('Verify')
        .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: 'Verification panel created!', ephemeral: true });
}