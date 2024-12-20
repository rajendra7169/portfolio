import React from "react";
import "./PublicationCard.css";
import { Fade } from "react-reveal";

export default function PublicationCard({ pub, theme }) {
  function openPubinNewTab(url) {
    var win = window.open(url, "_blank");
    win.focus();
  }

  return (
    <div
      className="publication-card-div"
      style={{ backgroundColor: theme.highlight }}
    >
      <Fade bottom duration={2000} distance="40px">
        <div key={pub.id} onClick={() => openPubinNewTab(pub.url)}>
          <div className="publication-name-div">
            <p className="publication-name" style={{ color: theme.text }}>
              {pub.name}
            </p>
          </div>
          <p className="publication-description" style={{ color: theme.text }}>
            {pub.description}
          </p>
          <div className="publication-details">
            <p
              className="publication-creation-date subTitle"
              style={{ color: theme.secondaryText }}
            >
              Published on {pub.createdAt.split("T")[0]}
            </p>
          </div>
        </div>
      </Fade>
    </div>
  );
}
