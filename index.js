import express from 'express';
import bodyParser from 'body-parser';
import admin from 'firebase-admin';
import { readFile } from 'fs/promises';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';

// Read service account key JSON file and initialize Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: "edvisoryquiz",
  private_key_id: "75f10206b2a452316a073e0638761ff12a634407",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCZayVoe8YjkYdg\nya3IwiD607NlCIoX6q+6aHqWFAS3DY1JoixVDK4wnisXZPWMAoIyAdObWVKy6Sum\n++a3gstcEqRZ7JU5P77gYXeN2H26IkZHOZyk4RXwScLXNA9L35YdnPTbXuUMIBr6\nCv2M9gkfkyU/n4EOMT4vc175DdarplLHyHHwdsb2d8XJ3iwNYbEVOVWtPR4Y6IxJ\npG8HvAt+UNbP+fUvPbaCFAp5cXDipbpStEPdXYXP6sxN8/iy3pbWdmDHX4Q0br8K\n3pibiRU/IT4+IXcLRjm/p7GHC6bxHWzeA+lmhD7bH/jtPXVaAaKVr/OFMBy5Fae0\nSQjFcjLHAgMBAAECggEAHF7/nnhRNm+pqODy9c7MmYX/xV3UZ8LbN24tyUYvbwif\nCbBnYV0Ec3I0htGBRSCLoiLLVo2oqPRMwccQrfwOjlrWMNj66YjbzBPKL52K9ppz\nA6XoTWdgjrydPv3eHEpfMN+/OjgsxFbFllrk86XmHwQvnbnp/E1n8g90TztbaQeC\nLbY+2BCq2YOhiY+g83XN3dZWFvG7c88OstA0m/fpfRv27bJx2+d5p7aRWXrVNSne\nSz2Azhy6i9R8McnH6bC2oRVgvSGbIsGAyA7Cboe1NCmEJ3uPmcPL4YVVssQvVYBg\nvo3DiO4UHlvEzNtjPHtDAoem/Nm6O/75FIqL9o7XYQKBgQDM40O6wqCNbzzznnUL\nntotr1Gq9QtdOlP93GUIn3j6Ro5QkLChFYQXJQLdN76V9+YDoswdPRdkSfl3BUcf\nhog9kwIPX0uR3Plp2P8ic86C6XRIajTQsNucn/IpiCkdw0ZutZb1G65QtzMwweVx\nNPOG7IXkzMmK5k1IYTymfUQKpwKBgQC/sOfwiC34rUXNyFG439v83OA4+hSonpEf\nq84utn2ReeLntz8dR2roDedtBqKLU16R5i/HKIbsH4GSJ5DAIevGx6cEVB62tuDj\n5oFWdu/hjyWIvPr1eRbWQTy+0XZfnZuMK08IHLYTZFzrpIhwTBRx89y/PAYkM2/l\nqpGbQk064QKBgBS4l0z4CgzDx0JMMEIwmpgsNvI3PiL7lysBcyZgGngVUqdLOtHP\nv0An+hYtYRUBsT2E5We/mfIGmTg0THEfxf+UMo0jch0aYA8YZxUw6R3MRnpcY2MH\nv+4jLvaMUrwz15eyvcWkOwjmvkKcGXxNgqOOoCv3mhp2GDLNwriDyrHZAoGBALLU\ng00uflTEsZ5tB3CFx2F7XeNJywQUCieVzGBf931ETJ8HoWXbPq0Ga6SW0AVS3aMX\nL/OIp3aZXfPP3YahHqjvkazEHXMv4VY7sOXNR7USKl4Kj8V6FggEDHuoRdql2ntF\n3BEhV+t3cgiUEoVRNLGqY4I0qTYUlouYOQazMAGBAoGAO+5w+PK27lVtQBzx7OzT\nYkMEOLDXuS5wz7bK/4JuomARsevi6OwtZWnSUT+YbXWqwUUXwRGQ8q9sEtG/1eAW\n8oSqrTZ37cdSq4lOBp8FsMCUfSQbxluB5p1EHKdz9IKcladF8tj22Pin7P6vkDhm\n9KamYs5OJ54CwWjkNvcM1Ps=\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-kusm6@edvisoryquiz.iam.gserviceaccount.com",
  client_id: "108539918831803537832",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-kusm6%40edvisoryquiz.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://edvisoryquiz-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.firestore();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3001;

app.get('/getAllUsers', async (req, res) => {
  try {
    const data = await db.collection('Users').get();
    
    const users = data.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log(users);

    if (!data.exists) {
      res.status(404).send('Document not found');
    } else {
      res.status(200).send(data.data());
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/getAllNotes', async (req, res) => {
  try {
    const data = await db.collection('Notes').get();
    
    const notes = data.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).send(notes);
    
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post('/signup', async (req, res) => {
  const { username, password, name } = req.body;

  try {
    const user = await db.collection('Users').where('username', '==', username).get();
    if (!user.empty) {
      return res.status(400).send({message: 'Username already exists'});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.collection('Users').add({
      username,
      password: hashedPassword,
      name,
      token: '',
      tokenexp: admin.firestore.Timestamp.now(),
    });

    res.status(201).send({message: 'User registered successfully'});
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post('/signin', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await db.collection('Users').where('username', '==', username).get();
    if (user.empty) {
      return res.status(404).send('User not found');
    }

    const userData = user.docs[0];
    const data = userData.data();

    const isPasswordValid = await bcrypt.compare(password, data.password);
    if (!isPasswordValid) {
      return res.status(401).send('Invalid password');
    }

    const SECRET_KEY = "signIn_Key";

    const token = jwt.sign({ username: data.username }, SECRET_KEY, { expiresIn: '1h' });
    const tokenExp = admin.firestore.Timestamp.fromDate(new Date(Date.now() + 3600 * 1000)); // 1 hour 

    // Update user with token and token expiration
    await db.collection('Users').doc(userData.id).update({
      token,
      tokenexp: tokenExp
    });

    res.status(200).send({ token });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post('/getuserinfo', async (req, res) => {
  const { token } = req.body;

  try {
    const user = await db.collection('Users').where('token', '==', token).get();
    if (user.empty) {
      return res.status(404).send({message: 'User not found'});
    }
    
    const userData = user.docs[0];
    const data = userData.data();
   
    res.status(200).send({ data });
  }
  catch (error) {
    console.log(error);
  }
});

app.post('/addNote', async (req, res) => {
  const { name, content, dateMade, group, madeBy } = req.body;

  try {

    const note = await db.collection('Notes').where('name', '==', name).get();
    if (!note.empty) {
      return res.status(400).send({message: 'Note already exists'});
    }

    const formattedDateMade = admin.firestore.Timestamp.fromDate(new Date(dateMade));

    await db.collection('Notes').add({
      name,
      content,
      dateMade: formattedDateMade,
      group,
      madeBy,
    });

    res.status(201).send({ message: "Success Add New Note." });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.delete('/deleteNote/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.collection('Notes').doc(id).delete();
    res.status(200).send({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post('/editNote', async (req, res) => {
  const { noteId, newName, newContent, newGroup, madeBy } = req.body;

  try {
    const noteDoc = db.collection('Notes').doc(noteId);
    const noteSnapshot = await noteDoc.get();

    if (!noteSnapshot.exists) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const existingNote = noteSnapshot.data();
    const oldName = existingNote.name;
    const oldContent = existingNote.content;
    const oldGroup = existingNote.group;

    const hasChanges = newName !== oldName || newContent !== oldContent || newGroup !== oldGroup;

    if (hasChanges) {
      await db.collection('Logs').add({
        dateFix: new Date(),
        madeBy: madeBy,
        noteId: noteId,
        oldname: oldName,
        oldcontent: oldContent,
        oldgroup: oldGroup,
      });

      await noteDoc.update({
        name: newName || '',
        content: newContent || '',
        group: newGroup || '',
      });

      res.status(200).json({ message: 'Note updated successfully' });
    } else {
      res.status(200).json({ message: 'No changes detected; Note not updated' });
    }
  } catch (error) {
    console.error('Error updating note:', error.message, error.stack);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

app.post('/getAllLogs', async (req, res) => {
  const { name } = req.body;

  try {
    const log = await db.collection('Logs').where('madeBy', '==', name).get();
    if (log.empty) {
      return res.status(404).send({message: 'Logs not found'});
    }
    
    const logs = log.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({ Logs: logs });

  }
  catch (error) {
    console.log(error);
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 

