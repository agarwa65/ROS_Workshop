const rosbag = require('rosbag');

// open a new bag at a given file location:
const bagOpen = rosbag.open('uploads/example.bag');

bagOpen.then((bag)=>{
    console.log(bag);
    bag.readMessages({topics: ['/turtle1/pose', '/turtle2/pose']}, (result) => {
    console.log(result.topic);
    console.log(result.message);
    });
}).catch(err=>{
    console.log('Something went wrong..');
    console.log(err);
})
