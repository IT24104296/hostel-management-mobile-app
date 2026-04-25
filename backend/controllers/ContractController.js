exports.addContract = async(req,res)=>{

const {name,studentId,moveInDate,duration,endDate} = req.body;

if(!name || !studentId || !moveInDate || !duration){
return res.status(400).json({message:"Missing fields"});
}

const contract = new Contract({
name,
studentId,
moveInDate,
duration,
endDate
});

await contract.save();

res.json({message:"Contract saved"});

};