const ACCURATE_SPEED_DATA = {
1: 0.00,
2: 9.02,
3: 12.01,
4: 16.31,
5: 19.88,
6: 22.27,
7: 25.84,
8: 29.25
};

let deviceState = {
elevatorFloor: 1,
isOperating: false,
timerInterval: null,
movementTimeout: null,

```
finalDestination: null,
intermediateStop: null,
stopDelay: 3
```

};

const uiArrow = document.getElementById('display-arrow');
const uiNumber = document.getElementById('display-number');
const uiTimer = document.getElementById('display-timer');

const upButton = document.getElementById('btn-up');
const downButton = document.getElementById('btn-down');
const floorPicker = document.getElementById('floor-picker');

function refreshPanelLayout() {
uiNumber.textContent =
String(deviceState.elevatorFloor).padStart(2, '0');
}

function travelTime(fromFloor, toFloor) {
return Math.abs(
ACCURATE_SPEED_DATA[toFloor] -
ACCURATE_SPEED_DATA[fromFloor]
);
}

function updateRemainingTime() {

```
let remain = 0;

if (
    deviceState.intermediateStop !== null &&
    deviceState.elevatorFloor !== deviceState.intermediateStop
) {
    remain += travelTime(
        deviceState.elevatorFloor,
        deviceState.intermediateStop
    );

    remain += deviceState.stopDelay;

    remain += travelTime(
        deviceState.intermediateStop,
        deviceState.finalDestination
    );
}
else if (
    deviceState.finalDestination !== null &&
    deviceState.elevatorFloor !== deviceState.finalDestination
) {
    remain += travelTime(
        deviceState.elevatorFloor,
        deviceState.finalDestination
    );
}

return remain;
```

}

function countdownLoop() {

```
deviceState.timerInterval = setInterval(() => {

    let remain = updateRemainingTime();

    if (remain <= 0.1) {
        return;
    }

    uiTimer.textContent =
        `${remain.toFixed(2)}초 뒤\n도착`;

}, 100);
```

}

function completeOperation(clickedButton) {

```
clearInterval(deviceState.timerInterval);

uiArrow.textContent = "─";

uiTimer.textContent =
    "0.00초 뒤\n도착 완료";

setTimeout(() => {

    uiTimer.textContent = "";

    clickedButton.classList.remove("active");

    deviceState.isOperating = false;
    deviceState.finalDestination = null;
    deviceState.intermediateStop = null;

}, 2500);
```

}

function moveElevatorSequence(clickedButton) {

```
const destination =
    deviceState.finalDestination;

const stopFloor =
    deviceState.intermediateStop;

if (
    stopFloor !== null &&
    stopFloor !== destination &&
    stopFloor !== deviceState.elevatorFloor
) {

    const firstMoveTime =
        travelTime(
            deviceState.elevatorFloor,
            stopFloor
        );

    setTimeout(() => {

        deviceState.elevatorFloor =
            stopFloor;

        refreshPanelLayout();

        uiTimer.textContent =
            `중간 호출\n${stopFloor}층 정차`;

        setTimeout(() => {

            const secondMoveTime =
                travelTime(
                    stopFloor,
                    destination
                );

            uiArrow.textContent =
                destination > stopFloor
                ? '↑'
                : '↓';

            setTimeout(() => {

                deviceState.elevatorFloor =
                    destination;

                refreshPanelLayout();

                completeOperation(
                    clickedButton
                );

            }, secondMoveTime * 1000);

        }, deviceState.stopDelay * 1000);

    }, firstMoveTime * 1000);

} else {

    const moveTime =
        travelTime(
            deviceState.elevatorFloor,
            destination
        );

    setTimeout(() => {

        deviceState.elevatorFloor =
            destination;

        refreshPanelLayout();

        completeOperation(
            clickedButton
        );

    }, moveTime * 1000);
}
```

}

function processCallSignal(dirType) {

```
if (deviceState.isOperating) return;

const userTargetFloor =
    parseInt(floorPicker.value);

if (
    deviceState.elevatorFloor ===
    userTargetFloor
) {

    uiTimer.textContent =
        "이미 현재 층에\n대기중입니다.";

    setTimeout(() => {
        uiTimer.textContent = "";
    }, 2000);

    return;
}

deviceState.isOperating = true;

deviceState.finalDestination =
    userTargetFloor;

const clickedButton =
    dirType === 'up'
    ? upButton
    : downButton;

clickedButton.classList.add('active');

uiArrow.textContent =
    userTargetFloor >
    deviceState.elevatorFloor
    ? '↑'
    : '↓';

countdownLoop();

moveElevatorSequence(
    clickedButton
);
```

}

upButton.addEventListener(
'click',
() => processCallSignal('up')
);

downButton.addEventListener(
'click',
() => processCallSignal('down')
);

window.addIntermediateStop =
function(floor) {

```
if (!deviceState.isOperating) {
    console.log(
        "현재 운행중이 아닙니다."
    );
    return;
}

if (
    floor < 1 ||
    floor > 8
) {
    console.log(
        "1~8층만 입력 가능합니다."
    );
    return;
}

if (
    floor ===
    deviceState.finalDestination
) {
    return;
}

deviceState.intermediateStop =
    floor;

console.log(
    `${floor}층 중간 호출 등록 완료`
);
```

};

refreshPanelLayout();
