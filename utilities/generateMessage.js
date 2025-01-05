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

function util_evaluate_progress(event) {
    // console.log('event.points_max', event.points_max);
    // console.log('event.start_time', event.start_time);
    // console.log('event.end_time', event.end_time);
    // console.log('event.points', event.points);
    // Get the current time as a timestamp
    const currentTime = Math.floor(Date.now() / 1000);

    // Calculate total time in milliseconds
    const totalTime = event.end_time - event.start_time;
    // console.log('totalTime', totalTime);

    // Calculate elapsed time in milliseconds
    const elapsedTime = currentTime - event.start_time;
    // console.log('elapsedTime', elapsedTime);

    // Calculate remaining time in milliseconds
    const remainingTime = event.end_time - currentTime;
    // console.log('remainingTime', remainingTime);

    // Calculate the expected rate of progress (points per millisecond)
    const expectedRate = event.points_max / totalTime;

    // Calculate the current rate of progress (points per millisecond)
    const currentRate = event.points / elapsedTime;

    // Calculate the expected points by now
    const expectedPoints = expectedRate * elapsedTime;

    // Calculate the remaining points
    const remainingPoints = event.points_max - event.points;

    // Calculate the required rate for the remaining time (points per millisecond)
    const requiredRate = remainingPoints / remainingTime;

    // Determine the progress status
    let status;
    if (event.points > expectedPoints) {
        status = 'pushing ahead';
    } else if (event.points < expectedPoints) {
        status = 'falling behind';
    } else {
        status = 'on track';
    }

    // Determine if the current rate is sufficient
    let rateStatus;
    if (currentRate >= requiredRate) {
        rateStatus = 'on track to meet your goal';
    } else {
        rateStatus = 'need to increase your rate to meet your goal';
    }

    let pointDifference = expectedPoints - event.points;

    const progress = {
        expectedRate: expectedRate.toFixed(6), // Adjust precision as needed
        currentRate: currentRate.toFixed(6),
        expectedPoints: expectedPoints.toFixed(0),
        remainingPoints: remainingPoints.toFixed(0),
        requiredRate: requiredRate.toFixed(6),
        status: status,
        rateStatus: rateStatus,
    };

    if (event.status === 'active') {
        return `> We are currently \`${status}\` of schedule by \`${Math.abs(
            pointDifference.toFixed(0)
        )}\` points`;
    } else {
        return '';
    }
}

// #region SHARED GENERATORS
function shared_progress(event) {
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

function shared_time_remaining(event, chat) {
    //setup time
    const now = new Date();
    const end = new Date(event.end_time * 1000).getTime();
    const timestamp = now.getTime();
    //calculate time remaining
    const remaining = end - timestamp;
    const remaining_human = util_milliseconds_to_human_time(remaining);
    const ended = `<t:${event.end_time}:R>`;

    const message =
        remaining >= 0
            ? `> Deadline ${remaining_human} remaining`
            : `> Event has ended ${ended}`;

    return message;
}

function shared_debug(event, chat) {
    const enable_debug = true; //environment === 'development' ? message : '';

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

    const message = `\n> ${message_created}\n> ${message_updated} (\`${message_updated_human}\`)\n> - \`event_id:\` \`${event.event_id}\``;

    if (enable_debug) {
        return message;
    }
    return '';
}
// #endregion

// #region DEFENCE GENERATORS
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

function generate_defence_message(event, chat) {
    try {
        const message_title = defence_title(event, chat);
        const message_info = defence_info(event, chat);
        const message_progress = shared_progress(event);
        const message_time_remaining = shared_time_remaining(event, chat);
        const message_eval = util_evaluate_progress(event);
        const message_debug = shared_debug(event, chat);

        const message = `
                ${message_title}\n${message_info}
                ${message_progress}
                ${message_time_remaining}
                ${message_eval}
                ${message_debug}
                `;
        return message;
    } catch (error) {
        console.error('error', error);
    }
}
// #endregion

// #region ATTACK GENERATORS
function attack_title(event, chat) {
    if (event.status === 'active') {
        return `**:dagger: <@&1322659004056338533> ASSAULT ON AN ENEMY HOMEWORLD HAS BEGUN!**`;
    }

    if (event.status === 'success') {
        return `**:dagger: <@&1322659004056338533> AN ENEMY HOMEWORLD HAS FALLEN!**`;
    }

    if (event.status === 'fail') {
        return `**:dagger: <@&1322659004056338533> ENEMY HOMEWORLD STANDS STRONG!**`;
    }
}

function attack_info(event, chat) {
    if (event.status === 'active') {
        return `> **All forces must converge on ${worlds[event.enemy]}!**`;
    }

    if (event.status === 'success') {
        return `> **Helldivers** have successfully defeated the ${
            enemies[event.enemy]
        } on ${worlds[event.enemy]}`;
    }

    if (event.status === 'fail') {
        return `> **Our glorious democratic assault** on ${
            worlds[event.enemy]
        } has been thwarted by **${enemies[event.enemy]}**`;
    }
}

function generate_attack_message(event, chat) {
    try {
        const message_title = attack_title(event, chat);
        const message_info = attack_info(event, chat);
        const message_progress = shared_progress(event);
        const message_time_remaining = shared_time_remaining(event, chat);
        const message_eval = util_evaluate_progress(event);
        const message_debug = shared_debug(event, chat);

        const message = `
                ${message_title}\n${message_info}
                ${message_progress}
                ${message_time_remaining}
                ${message_eval}
                ${message_debug}\n\n
                `;
        return message;
    } catch (error) {
        console.error('error', error);
    }
}
// #endregion

module.exports = { generate_defence_message, generate_attack_message };
