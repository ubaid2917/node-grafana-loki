function getRandomValue(array){
    const randomElement = array[Math.floor(Math.random() * array.length)];
    return randomElement;
}

function doSomeHeavyTask(){
    const ms = getRandomValue([100,150,200,250,300,350,400,450,500,700,650, 1000, 1400, 2500]);
     
    const shouldThrowError = getRandomValue([1,2,3,4,5,6,7,8,9])  === 8;

    if(shouldThrowError){
        const randomError = getRandomValue([
            "DB payment failure",
            "DB Server is down",
            "Access Denied",
            "Not Found Error",
            "Network Error",
        ]) 

        throw new Error(randomError)
    }
    return new Promise((resolve, reject) => setTimeout(() => resolve(ms), ms));
} 

module.exports = {
    doSomeHeavyTask
}