import React, { useState, useEffect, useRef } from "react";
import { Table, Row, Col, Tooltip, User, Text, Grid, Spacer, Textarea, Button } from "@nextui-org/react";
import { StyledBadge } from "./Table/StyledBadge";
import { IconButton } from "./Table/IconButton";
import { EyeIcon } from "./Table/EyeIcon";
import { DeleteIcon } from "./Table/DeleteIcon";
import { EditIcon } from "./Table/EditIcon";
import styles from "../styles/Table.module.css";
import { jsPDF } from "jspdf";

function TableFile() {

    const [listDocs, setListDocs] = useState([]);
    const [chosen, setChosen] = useState("");
    const [status, setStatus] = useState(false);
    const dataFetchedRef = useRef(false);
    const textareaRef = React.useRef(null);

    useEffect(() => {
        if (dataFetchedRef.current) return;
        dataFetchedRef.current = true;
        fetchList();
    }, []);

    const fetchList = async () => {
        fetch(process.env.NEXT_PUBLIC_BACKEND_URI + "/docs", {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        }).then((result) => {
            result.json().then((x) => {
                console.log('listDocs', x);
                setListDocs(x);
            });
        })
    }

    // Download Report
    const downloadPdf = (_id) => {
        listDocs.map((result) => {
            console.log("result", result.id);
            if (_id == result.id && result.status == "processed") {
                fetch(process.env.NEXT_PUBLIC_BACKEND_URI + "/view", {
                    method: "POST",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id: _id
                    })
                }).then((result) => {
                    result.json().then(async (x) => {
                        const doc = new jsPDF();
                        doc.setFontSize(10);
                        var y = 10;
                        for (var i = 0; i < x.Result1.length; i++) {
                            var clause = await doc.splitTextToSize(`Clause: ${x.Result1[i].Clause} => ${x.Result1[i].ClauseText}`, 280);
                            var lineHeight = doc.getTextDimensions(clause);

                            if (y > 280) {
                                y = 15;
                                doc.addPage();
                            }
                            doc.text(10, y, `${clause}`, { maxWidth: 180 });
                            y = y + lineHeight.h + 20
                        }
                        doc.save('Report.pdf');
                        // window.open(doc.output('bloburl')); // Preview
                    });
                });
            }
        })
    };

    // View Report
    const viewDocs = (_id) => {
        listDocs.map((result) => {
            if (_id == result.id && result.status == "processed") {
                fetch(process.env.NEXT_PUBLIC_BACKEND_URI + "/view", {
                    method: "POST",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id: _id
                    })
                }).then((result) => {
                    result.json().then(async (x) => {
                        const doc = new jsPDF();
                        doc.setFontSize(10);
                        var y = 10;
                        for (var i = 0; i < x.Result1.length; i++) {
                            var clause = await doc.splitTextToSize(`Clause: ${x.Result1[i].Clause} => ${x.Result1[i].ClauseText}`, 280);
                            var lineHeight = doc.getTextDimensions(clause);

                            if (y > 280) {
                                y = 15;
                                doc.addPage();
                            }
                            doc.text(10, y, `${clause}`, { maxWidth: 180 });
                            y = y + lineHeight.h + 20
                        }
                        // doc.save('Report.pdf');
                        window.open(doc.output('bloburl')); // Preview
                    });
                });
            }
        })
    };

    const getDataID = (_id) => {
        listDocs.map((result) => {
            if (_id == result.id) {
                const buf = Buffer.from(result.file.data);
                if (textareaRef.current) {
                    textareaRef.current.value = buf.toString();
                    setChosen(_id);
                }
            }
        })
    };

    // handle update status
    const statusUpdate = (_id) => {
        fetch(process.env.NEXT_PUBLIC_BACKEND_URI + "/statusUpdate", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: _id
            })
        }).then((result) => {
            setStatus(false);
            fetchList();
        });
    };

    // delete fIle
    const deleteFile = (_id) => {
        fetch(process.env.NEXT_PUBLIC_BACKEND_URI + "/delete", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"

            },
            body: JSON.stringify({
                id: _id
            })
        }).then((result) => {
            result.text().then((x) => { alert(x) })
            fetchList();
        });
    };

    const columns = [
        { name: "NAME", uid: "name" },
        { name: "UPLOAD DATE", uid: "date" },
        { name: "PROCESS DATE", uid: "pdate" },
        { name: "STATUS", uid: "status" },
        { name: "ACTIONS", uid: "actions" },
    ];
    const renderCell = (doc, columnKey) => {
        const cellValue = doc[columnKey];
        switch (columnKey) {
            case "name":
                return (
                    <Col aria-labelledby="name" onClick={() => {
                        getDataID(doc.id)
                    }}>
                        {doc.name}
                    </Col>
                );
            case "date":
                return (
                    <Col aria-labelledby="name">
                        {doc.date}
                    </Col>
                );
            case "status":
                return (
                    <StyledBadge aria-labelledby="status" type={doc.status}>{cellValue}</StyledBadge>
                );

            case "actions":
                return (
                    <Row aria-labelledby="row" justify="center" align="center">
                        <Col css={{ d: "flex" }}>
                            <Tooltip content="View Report">
                                <IconButton aria-label="viewButton" onClick={() => {
                                    viewDocs(doc.id)
                                }}>
                                    <EyeIcon size={20} fill="#979797" />
                                </IconButton>
                            </Tooltip>
                        </Col>
                        <Col css={{ d: "flex" }}>
                            <Tooltip content="Process Report">
                                <IconButton aria-label="editButton" onClick={() =>
                                    statusUpdate(doc.id)
                                }>
                                    <EditIcon size={20} fill="#979797" />
                                </IconButton>
                            </Tooltip>
                        </Col>
                        <Col css={{ d: "flex" }}>
                            <Tooltip content="Delete Report">
                                <IconButton aria-label="deleteButton" onClick={() =>
                                    deleteFile(doc.id)
                                }>
                                    <DeleteIcon size={20} fill="#979797" />
                                </IconButton>
                            </Tooltip>
                        </Col>
                    </Row>
                );
            default:
                return cellValue;
        }
    };

    return (
        <div className={styles.table}>
            <Table
                selectionMode="none"
                aria-labelledby="table"
            >
                <Table.Header columns={columns}>
                    {(column) => (
                        <Table.Column
                            key={column.uid}
                            hideHeader={column.uid === "actions"}
                            align={column.uid === "actions" ? "center" : "start"}
                        >
                            {column.name}
                        </Table.Column>
                    )}
                </Table.Header>
                <Table.Body items={listDocs}>
                    {(item) => (
                        <Table.Row>
                            {(columnKey) => (
                                <Table.Cell>{renderCell(item, columnKey)}</Table.Cell>
                            )}
                        </Table.Row>
                    )}
                </Table.Body>
            </Table>

            <Spacer y={2} />


            <Grid.Container className={styles.grid} aria-label="download">
                <Textarea
                    readOnly
                    ref={textareaRef}
                    aria-label="download"
                    rows='10'
                    cols='100'
                    className={styles.textarea}
                />
                <Spacer y={2} />
                <Grid.Container className={styles.grid} aria-label="download">
                    <Grid>
                        <Button className={styles.button} color="secondary" size="sm" onClick={() => {
                            downloadPdf(chosen)
                        }}>
                            Download report
                        </Button>
                    </Grid>
                </Grid.Container>
            </Grid.Container>
        </div>

    );
}

export default TableFile;