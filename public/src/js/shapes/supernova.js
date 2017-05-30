var rotLong = 0;
var rotMid = 2.5;
var rotShorts = 7.5;
var rotBold = 0;

var width = 640;
var offset = 50;

var longsGroup = new Group({});
var midsGroup = new Group({});
var boldGroup = new Group({});
var shortsGroup = new Group({});

function onFrame(event) {

    if (event.count < 12) {
        rotLong += 15;
        var longLine = new Path.Line({
            from: [0, 300],
            to: [width, 300],
            strokeColor: {
                gradient: {
                    stops: ['#2e9ad0', 'rgba(35,35,40, 0)', '#2e9ad0']
                },
                origin: [0, 150],
                destination: [width, 150]
            },
            strokeWidth: 2,
            dashArray: [2, 8]
        }).rotate(rotLong);
        longsGroup.addChild(longLine);

        rotMid += 15;
        var midLine = new Path.Line({
            from: [offset, 300],
            to: [width - offset, 300],
            strokeColor: {
                gradient: {
                    stops: ['#2e9ad0', 'rgba(35,35,40, 0)', '#2e9ad0']
                },
                origin: [offset, 300],
                destination: [width - offset, 100]
            },
            strokeWidth: 2,
            dashArray: [2, 5]
        }).rotate(rotMid);
        midsGroup.addChild(midLine);
    }

    if (event.count > 12 && event.count < 25) {
        rotShorts += 15;
        var shortsLine = new Path.Line({
            from: [offset * 2, 300],
            to: [width - (offset * 2), 300],
            strokeColor: {
                gradient: {
                    stops: ['#2e9ad0', 'rgba(35,35,40, 0)', '#2e9ad0']
                },
                origin: [offset * 2, 150],
                destination: [width - (offset * 2), 150]
            },
            strokeWidth: 2,
            dashArray: [2, 5]
        }).rotate(rotShorts);
        shortsGroup.addChild(shortsLine);

        rotBold += 15;
        var boldLine = new Path.Line({
            from: [offset * 4, 300],
            to: [width - (offset * 4), 300],
            strokeColor: {
                gradient: {
                    stops: ['#2e9ad0', 'rgba(35,35,40, 0)', '#2e9ad0']
                },
                origin: [offset * 3, 150],
                destination: [width - (offset * 3), 150]
            },
            strokeWidth: 2
        }).rotate(rotBold);
        boldGroup.addChild(boldLine);
    }

    longsGroup.rotate(.01);
    midsGroup.rotate(.05);
    shortsGroup.rotate(.1);
    boldGroup.rotate(.15)
}
