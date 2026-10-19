import { createEngineClient, sendMessages } from "@orchestration-ai/sdk/services";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions";
import { onDocumentCreated } from "firebase-functions/firestore";

initializeApp();
setGlobalOptions({ region: 'us-central1' });

const db = getFirestore();


export const tailorCvAndCoverLetter = onDocumentCreated(
  {
    document: 'users/{uid}/jobs/{jobId}',
  },
  async (event) => {
    const clientSecret = 'oai_O8hzMEJOX70UGPE6In5CTsFTvzfH7Z';
    const agentId = '56gbbh52H35qART1L8MC';

    const snapshot = event.data!;

    const { uid, jobId } = event.params as { uid: string; jobId: string };
    const job = snapshot.data();
    const jobDescription = job?.jobDescription ?? '';

    const userDoc = await db.collection('users').doc(uid).get();
    const cv = userDoc.data()?.cv ?? '';

    const engineClient = createEngineClient(clientSecret);

    const cvAndJobDescription = `
      CV: ${cv}
      JOB DESCRIPTION: ${jobDescription}
    `.trim();

    try {
      const generatedCv = await sendMessages(agentId, 0, [{ message: `Generate the tailored CV:\n${cvAndJobDescription}` }], '', engineClient);
      const generatedCoverLetter = await sendMessages(agentId, 0, [{ message: `Generate the tailored cover letter:\n${cvAndJobDescription}` }], '', engineClient);

      await snapshot.ref.update({
        generatedCv,
        generatedCoverLetter,
        generatedAt: new Date(),
      });

      console.log(`Generated CV + cover letter for job ${jobId}`);
    } catch (err) {
      console.error(`Orchestration AI call failed for job ${jobId}:`, err);
      await snapshot.ref.update({ generationError: String(err) });
    }
  }
);
