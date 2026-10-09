const { MongoClient } = require("mongodb");
const url = "mongodb://127.0.0.1:27017";
const client = new MongoClient(url);
const dbName = "studentDB";
const collectionName = "students";

async function main() {
  try {
    // Connect to MongoDB
    await client.connect();

    console.log("\nConnected to MongoDB!");
    console.log("Database:", dbName);
    console.log("Collection:", collectionName);

    // Select database
    const db = client.db(dbName);
    // Select collection
    const collection = db.collection(collectionName);

    // ---------------------------------------------
    // READ CURRENT DATA FROM MONGODB
    // ---------------------------------------------
    const students = await collection.find({}).toArray();

    console.log("\n====================================");
    console.log("CURRENT DATA FROM MONGODB");
    console.log("====================================");

    students.forEach(student => {
      console.log("\nStudent ID:", student.studentId);
      console.log("Name:", student.name);
      console.log("Department:", student.department);
      console.log("Subjects:");
      student.subjects.forEach(subject => {
        console.log(
          "  ",
          subject.subject,
          "Marks:",
          subject.marks,
          "Grade:",
          subject.grade
        );
      });
    });

    // ---------------------------------------------
    // AGGREGATION
    // ---------------------------------------------
    console.log("\n====================================");
    console.log("UPDATED GRADE SUMMARY");
    console.log("====================================");

    const result = await collection.aggregate([
      {
        // 1. Flatten the subjects array so we can compute math on individual objects
        $unwind: "$subjects"
      },
      {
        // 2. Group by student and calculate the metrics
        $group: {
          _id: "$studentId",
          name: { $first: "$name" },
          department: { $first: "$department" },
          totalMarks: { $sum: "$subjects.marks" },
          averageMarks: { $avg: "$subjects.marks" },
          highestMarks: { $max: "$subjects.marks" },
          lowestMarks: { $min: "$subjects.marks" }
        }
      },
      {
        // 3. Format the final output structure
        $project: {
          _id: 0,
          studentId: "$_id",
          name: 1,
          department: 1,
          totalMarks: 1,
          averageMarks: 1,
          highestMarks: 1,
          lowestMarks: 1
        }
      }
    ]).toArray();

    // Print the aggregation results
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    // Ensure the client closes when finished/error occurs
    await client.close();
  }
}

main();
