
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

const STOP_DELAY = 3;

let deviceState = {
    elevatorFloor: 1,
    isOperating: false,
    destinationFloor: null,
    selectedStops: [],
    timerInterval: null
};

const uiArrow = document.getElementById("display-arrow");
const uiNumber = document.getElementById("display-number");
const uiTimer = document.getElementById("display-timer");

const upButton = document.getElementById("btn-up");
const downButton = document.getElementById("btn-down");
const floorPicker = document.getElementById("floor-picker");

const stopButtons =
    document.querySelectorAll(".stop-floor-btn");

function refreshPanelLayout() {
    uiNumber.textContent =
        String(deviceState.elevatorFloor)
        .padStart(2, "0");
}

function travelTime(fromFloor, toFloor) {
    return Math.abs(
        ACCURATE_SPEED_DATA[toFloor] -
        ACCURATE_SPEED_DATA[fromFloor]
    );
}

function getRoute() {

    const start =
        deviceState.elevatorFloor;

    const destination =
        deviceState.destinationFloor;

    let route = [];

    if (destination > start) {

        route =
            deviceState.selectedStops
            .filter(f =>
                f > start &&
                f < destination
            )
            .sort((a,b)=>a-b);

    } else {

        route =
            deviceState.selectedStops
            .filter(f =>
                f < start &&
                f > destination
            )
            .sort((a,b)=>b-a);
    }

    route.push(destination);

    return route;
}

function calculateRemainingTime() {

    if (
        !deviceState.isOperating ||
        deviceState.destinationFloor === null
    ) {
        return 0;
    }

    let current =
        deviceState.elevatorFloor;

    let total = 0;

    const route = getRoute();

    route.forEach((floor,index)=>{

        total +=
            travelTime(current,floor);

        if(index < route.length - 1){
            total += STOP_DELAY;
        }

        current = floor;
    });

    return total;
}

function startTimer() {

    clearInterval(
        deviceState.timerInterval
    );

    deviceState.timerInterval =
        setInterval(()=>{

            const remain =
                calculateRemainingTime();

            uiTimer.textContent =
                `${remain.toFixed(2)}초 뒤\n도착`;

        },100);

}

async function moveToFloor(targetFloor){

    const floors =
        Math.abs(
            targetFloor -
            deviceState.elevatorFloor
        );

    const totalTime =
        travelTime(
            deviceState.elevatorFloor,
            targetFloor
        );

    const interval =
        (totalTime / floors) * 1000;

    const direction =
        targetFloor >
        deviceState.elevatorFloor
        ? 1
        : -1;

    return new Promise(resolve=>{

        let moved = 0;

        const step =
            setInterval(()=>{

                deviceState.elevatorFloor +=
                    direction;

                refreshPanelLayout();

                moved++;

                if(moved >= floors){

                    clearInterval(step);

                    resolve();

                }

            },interval);

    });

}

async function startOperation(clickedButton){

    const route =
        getRoute();

    for(let i=0;i<route.length;i++){

        const floor =
            route[i];

        uiArrow.textContent =
            floor >
            deviceState.elevatorFloor
            ? "↑"
            : "↓";

        await moveToFloor(floor);

        if(i < route.length - 1){

            uiTimer.textContent =
                `${floor}층 정차\n3초 대기`;

            await new Promise(r=>
                setTimeout(
                    r,
                    STOP_DELAY * 1000
                )
            );
        }
    }

    clearInterval(
        deviceState.timerInterval
    );

    uiArrow.textContent = "─";

    uiTimer.textContent =
        "도착 완료";

    stopButtons.forEach(btn=>{
        btn.classList.remove("active");
    });

    deviceState.selectedStops = [];
    deviceState.destinationFloor = null;

    setTimeout(()=>{

        uiTimer.textContent = "";

        clickedButton.classList.remove(
            "active"
        );

        deviceState.isOperating = false;

    },2000);
}

function processCallSignal(dirType){

    if(deviceState.isOperating){
        return;
    }

    const targetFloor =
        parseInt(
            floorPicker.value
        );

    if(
        targetFloor ===
        deviceState.elevatorFloor
    ){

        uiTimer.textContent =
            "이미 현재 층";

        setTimeout(()=>{
            uiTimer.textContent = "";
        },1500);

        return;
    }

    deviceState.isOperating = true;

    deviceState.destinationFloor =
        targetFloor;

    const clickedButton =
        dirType === "up"
        ? upButton
        : downButton;

    clickedButton.classList.add(
        "active"
    );

    startTimer();

    startOperation(
        clickedButton
    );
}

upButton.addEventListener(
    "click",
    ()=>processCallSignal("up")
);

downButton.addEventListener(
    "click",
    ()=>processCallSignal("down")
);

stopButtons.forEach(btn=>{

    btn.addEventListener(
        "click",
        ()=>{

            const floor =
                parseInt(
                    btn.dataset.floor
                );

            const index =
                deviceState.selectedStops
                .indexOf(floor);

            if(index >= 0){

                deviceState.selectedStops
                .splice(index,1);

                btn.classList.remove(
                    "active"
                );

            }else{

                deviceState.selectedStops
                .push(floor);

                btn.classList.add(
                    "active"
                );
            }

        }
    );

});

refreshPanelLayout();

