import React, { useReducer } from "react";
import Head from "next/head";
import DropZone from "../components/DropZone";
import styles from "../styles/Home.module.css";
import TableFile from "../components/TableFile";
import { SSRProvider } from '@react-aria/ssr';

export default function Home() {
  // reducer function to handle state changes
  const reducer = (state, action) => {
    switch (action.type) {
      case "SET_IN_DROP_ZONE":
        return { ...state, inDropZone: action.inDropZone };
      case "ADD_FILE_TO_LIST":
        return { ...state, fileList: state.fileList.concat(action.files) };
      default:
        return state;
    }
  };

  // const client = MongoClient.connect(process.env.MONGOURL);
  // client.then((result) => {
  //   console.log('connected', result);
  // });

  // destructuring state and dispatch, initializing fileList to empty array
  const [data, dispatch] = useReducer(reducer, {
    inDropZone: false,
    fileList: [],
  });

  return (
    <SSRProvider>
      <div className={styles.container}>
        <Head>
          <title>Compliancy Checker</title>
          <meta name="description" content="Nextjs drag and drop file upload" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={styles.main}>
          <p className={styles.title}>COMPLIANCY ANALYTICS TOOL</p>
          {/* Pass state data and dispatch to the DropZone component */}
          <DropZone data={data} dispatch={dispatch} />
          <TableFile aria-label="table" />
          {/* <Download aria-label="download" data={data}/> */}
        </main>

      </div>
    </SSRProvider>
  );
}
