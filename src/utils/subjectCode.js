// ÕIS subject codes and subject-card links (https://ois2.tlu.ee/tluois/aine/HKI5025.HK)
export const OIS_SUBJECT_URL = "https://ois2.tlu.ee/tluois/aine/";

export const oisUrl = (code) => (code ? OIS_SUBJECT_URL + code.trim() : "");
export const isOisUrl = (url) => !url || url.startsWith(OIS_SUBJECT_URL);

// The subject's own code, else the one in its ÕIS link (curricula imported before codes were stored)
export const subjectCode = (s) => s.code || (s.url || "").replace(OIS_SUBJECT_URL, "").match(/^[A-Z0-9]+\.[A-Z]+$/)?.[0] || "";

// New code for a subject: the link follows the code unless it points somewhere else (e.g. a Google Doc)
export const withCode = (s, code) => ({ ...s, code, url: isOisUrl(s.url) ? oisUrl(code) : s.url });
