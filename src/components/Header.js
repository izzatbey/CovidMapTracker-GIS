import React from "react";
import { Link } from "gatsby";
import { FaGithub } from "react-icons/fa";

import { useSiteMetadata } from "hooks";

import Container from "components/Container";

const Header = () => {
  const { companyName, companyUrl } = useSiteMetadata();

  return (
    <header>
      <Container type="content">
        <p>
          <Link to="/">Vaksinasi Indonesia GIS</Link>
        </p>
        <ul>
          <li>
            <Link to="/chloropleth-hospital/">
              Chloropleth Faskes Vaksinasi
            </Link>
          </li>
          <li>
            <Link to="/chloropleth-vaccinated/">
              Chloropleth Jumlah Vaksinasi
            </Link>
          </li>
        </ul>
      </Container>
    </header>
  );
};

export default Header;
