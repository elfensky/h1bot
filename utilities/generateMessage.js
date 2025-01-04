const chalk = require('chalk');

const enemies = require('../enums/enemies');
const worlds = require('../enums/homeworlds');
const map = require('../enums/map');

const environment = process.env.NODE_ENV || 'development';

function util_milliseconds_to_human_time(ms) {
    // Calculate total seconds
    const totalSeconds = Math.floor(ms / 1000);

    // Calculate hours, minutes, and seconds
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Format the time as HH:MM:SS
    // const hours = ``;
    const msg1 = `\`${hours.toString().padStart(2, '0')} Hours\``;
    const msg2 = `\`${minutes.toString().padStart(2, '0')} Minutes\``;
    const msg3 = `\`${seconds.toString().padStart(2, '0')} Seconds\``;

    return `${msg1} ${msg2} ${msg3}`;
}

function util_generate_progress_bar(percentage) {
    const totalBlocks = 12; // Total number of blocks in the progress bar

    if (!typeof percentage === 'number') {
        console.log('percentage must not a number');
        throw new Error('percentage must be a number');
        // return;
    }

    const filledBlocks = Math.round((percentage / 100) * totalBlocks); // Calculate the number of filled blocks

    const full = '■'; //■ //✅ //▰
    const empty = '□'; //□ //☑️ //▱

    const progressBar =
        full.repeat(filledBlocks) + empty.repeat(totalBlocks - filledBlocks);

    // Return the progress bar with the percentage
    return `${progressBar} ${percentage}%`;
}

// #region DEFENCE TEXT SECTION GENERATORS
function defence_title(event, chat) {
    if (event.status === 'active') {
        if (event.region !== 0) {
            return `**:shield: <@&1322659004056338533> A CAPITAL CITY IS UNDER ATTACK!**`;
        } else {
            return `**:shield: <@&1322659004056338533> SUPER EARTH IS UNDER ATTACK!!!**`;
        }
    }

    if (event.status === 'success') {
        if (event.region !== 0) {
            return `**:shield: <@&1322659004056338533> A CAPITAL CITY SECURES VICTORY!**`;
        } else {
            return `**:shield: <@&1322659004056338533> SUPER EARTH STANDS STRONG AGAINST THE ENEMY!!!**`;
        }
    }

    if (event.status === 'failure') {
        if (event.region !== 0) {
            return `**:shield: <@&1322659004056338533> A CAPITAL CITY HAS FALLEN!**`;
        } else {
            return `**:shield: <@&1322659004056338533> HUMANITY HAS FALLEN!!!**`;
        }
    }
}

function defence_info(event, chat) {
    if (event.status === 'active') {
        return `> **${enemies[event.enemy]}** are attacking the **${
            map[event.enemy][event.region]
        }** `;
    }

    if (event.status === 'success') {
        return `> Helldivers have **repelled** the **${
            enemies[event.enemy]
        }** in the **${map[event.enemy][event.region]}**`;
    }

    if (event.status === 'failure') {
        return `> Helldivers have been **defeated** by **${
            enemies[event.enemy]
        }** in the **${map[event.enemy][event.region]}**`;
    }
}

function defence_progress(event) {
    const progress =
        event.points <= event.points_max
            ? Math.floor((event.points / event.points_max) * 100)
            : 'n/a';
    const bar =
        typeof progress === 'number'
            ? util_generate_progress_bar(progress)
            : 'n/a';

    return `> Progress \`${bar}\` \`${event.points}/${event.points_max}\``;
}

function defence_time_remaining(event, chat) {
    //setup time
    const now = new Date();
    const end = new Date(event.end_time * 1000).getTime();
    const timestamp = now.getTime();
    //calculate time remaining
    const remaining = end - timestamp;
    const remaining_human = util_milliseconds_to_human_time(remaining);

    const ended = new Date(event.end_time * 1000).toLocaleString('en-US', {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
    });

    const message =
        remaining >= 0
            ? `> Deadline ${remaining_human} remaining`
            : `> Defend Event has ended at \`${ended}\` UTC+0`;

    return message;
}

function defence_debug(event, chat) {
    const message_created = chat
        ? `\`chat started on\` <t:${Math.floor(chat.message_created / 1000)}:F>`
        : `\`chat started on\` <t:${Math.floor(Date.now() / 1000)}:F>`;

    const message_updated = chat
        ? `\`last updated on\` <t:${Math.floor(chat.message_updated / 1000)}:R>`
        : `\`last updated on\` <t:${Math.floor(Date.now() / 1000)}:R>`;

    const message_updated_human = new Date(
        chat ? chat.message_updated : Date.now()
    ).toLocaleTimeString('en-US', {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    const message = `\n${message_created}\n${message_updated} (\`${message_updated_human}\`)\n- \`event_id:\` \`${event.event_id}\``;
    return message;
}
// #endregion

// #region DEFEND MESSAGE
function generate_defence_message(event, chat) {
    try {
        const message_title = defence_title(event, chat);
        const message_info = defence_info(event, chat);
        const message_progress = defence_progress(event);
        const message_time_remaining = defence_time_remaining(event, chat);
        const message_debug =
            environment === 'development' ? defence_debug(event, chat) : '';

        const message = `${message_title}
                ${message_info}
                ${message_progress}
                ${message_time_remaining}
                ${message_debug}
                `;
        return message;
    } catch (error) {
        console.error('error', error);
    }
}
// #endregion

// #region ATTACK MESSAGE
function attackMessage(event, chat) {
    //setup time
    const now = new Date();
    const message_created_human = new Date(
        chat ? chat.message_created : Date.now()
    ).toLocaleTimeString('en-US', {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
    });
    const message_updated_human = new Date(
        chat ? chat.message_updated : Date.now()
    ).toLocaleTimeString('en-US', {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
    });

    const end = new Date(event.end_time * 1000).getTime();
    const timestamp = now.getTime();
    //calculate time remaining
    const remaining = end - timestamp;
    const remaining_human = util_milliseconds_to_human_time(remaining);
    const progress =
        event.points <= event.points_max
            ? Math.floor((event.points / event.points_max) * 100)
            : 'NaN';
    const bar = util_generate_progress_bar(progress);

    if (event.status === 'active') {
        const message = `
<@&1322659004056338533>\n
**🗡️🌎 A PLANETARY ASSAULT HAS BEGUN**

**All forces must converge on ${worlds[event.enemy]}!**

Progress: \`${bar}\`
Points: \`${event.points}/${event.points_max}\`
Time: ${remaining_human} remaining

\`message created\` at \`${message_created_human} UTC+0\`
\`message updated\` at \`${message_updated_human} UTC+0\` \n
        `;
        return message;
    }

    if (event.status === 'fail') {
        const message = `
<@&1322659004056338533>\n
**🗡️💀 SHAMEFUL DEFEAT**

**Our glorious democratic assault** on ${
            worlds[event.enemy]
        } has been thwarted by **${enemies[event.enemy]}**
Progress: \`${bar}\`
Points: \`${event.points}/${event.points_max}\`

\`message created\` at \`${message_created_human} UTC+0\`
\`message updated\` at \`${message_updated_human} UTC+0\` \n
        `;
        return message;
    }

    if (event.status === 'success') {
        const message = `
<@&1322659004056338533>\n
**🗡️🕊️ PACIFICATION COMPLETE**

**Helldivers** have successfully defeated the ${enemies[event.enemy]} on ${
            worlds[event.enemy]
        }
Progress: \`${bar}\`
Points: \`${event.points}/${event.points_max}\`

\`message created\` at \`${message_created_human} UTC+0\`
\`message updated\` at \`${message_updated_human} UTC+0\` \n
        `;
        return message;
    }
}
// #endregion

module.exports = { generate_defence_message, attackMessage };
