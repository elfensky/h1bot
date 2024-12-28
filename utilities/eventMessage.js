const enemies = require('../enums/enemies');
const map = require('../enums/map');

function eventMessage(data, event) {
    //setup time
    const now = new Date();
    const message_created_human = new Date(
        event ? event.message_created : Date.now()
    ).toLocaleTimeString('en-US', {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
    });
    const message_updated_human = new Date(
        event ? event.message_updated : Date.now()
    ).toLocaleTimeString('en-US', {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
    });

    const end = new Date(data.end_time * 1000).getTime();
    const timestamp = now.getTime();
    //calculate time remaining
    const remaining = end - timestamp;
    const remaining_human = millisecondsToTime(remaining);
    const progress = Math.floor((data.points / data.points_max) * 100);
    const bar = generateProgressBar(progress);

    if (data.status === 'active') {
        const message = `
**🚨 A CAPITAL CITY IS UNDER ATTACK**

**${enemies[data.enemy]}** are attacking the **${
            map[data.enemy][data.region]
        }** 
Progress: \`${bar}\`\n
Points: \`${data.points}/${data.points_max}\`
Time: \`${remaining_human}\` remaining

\`message created\` at \`${message_created_human} UTC+0\`
\`message updated\` at \`${message_updated_human} UTC+0\` \n
        `;
        return message;
    }

    if (data.status === 'failure') {
        const message = `
**💀 SHAMEFUL DEFEAT**

**Our glorious democracy** has been defeated in the **${
            map[data.enemy][data.region]
        }** by **${enemies[data.enemy]}**
Progress: ${bar}
Points: \`${data.points}/${data.points_max}\`

\`message created\` at \`${message_created_human} UTC+0\`
\`message updated\` at \`${message_updated_human} UTC+0\` \n
        `;
        return message;
    }

    if (data.status === 'success') {
        const message = `
**🎉 GLORIOUS VICTORY**

**Helldivers** have successfully defended the **${
            map[data.enemy][data.region]
        }** against ${enemies[data.enemy]}
Progress: \`${bar}\`
Points: \`${data.points}/${data.points_max}\`

\`message created\` at \`${message_created_human} UTC+0\`
\`message updated\` at \`${message_updated_human} UTC+0\` \n
        `;
        return message;
    }
}

function millisecondsToTime(ms) {
    // Calculate total seconds
    const totalSeconds = Math.floor(ms / 1000);

    // Calculate hours, minutes, and seconds
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Format the time as HH:MM:SS
    const formattedTime = `${hours.toString().padStart(2, '0')} Hours ${minutes
        .toString()
        .padStart(2, '0')} Minutes ${seconds
        .toString()
        .padStart(2, '0')} Seconds`;

    return formattedTime;
}

function generateProgressBar(percentage) {
    const totalBlocks = 12; // Total number of blocks in the progress bar
    const filledBlocks = Math.round((percentage / 100) * totalBlocks); // Calculate the number of filled blocks

    const full = '■'; //■ //✅ //▰
    const empty = '□'; //□ //☑️ //▱

    const progressBar =
        full.repeat(filledBlocks) + empty.repeat(totalBlocks - filledBlocks);

    // Return the progress bar with the percentage
    return `${progressBar} ${percentage}%`;
}

module.exports = eventMessage;
