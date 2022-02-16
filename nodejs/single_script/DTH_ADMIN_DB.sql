-- MySQL dump 10.13  Distrib 5.7.36, for Linux (x86_64)
--
-- Host: localhost    Database: DTH_ADMIN_DB
-- ------------------------------------------------------
-- Server version	5.7.36-0ubuntu0.18.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `contract_orders`
--

DROP TABLE IF EXISTS `contract_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contract_orders` (
  `chainid` bigint(20) DEFAULT NULL,
  `orderid` bigint(20) DEFAULT NULL,
  `transactionSent` tinyint(4) DEFAULT '0',
  `secretText` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contract_orders`
--

LOCK TABLES `contract_orders` WRITE;
/*!40000 ALTER TABLE `contract_orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `contract_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nonce_admin_table`
--

DROP TABLE IF EXISTS `nonce_admin_table`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `nonce_admin_table` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `walletid` varchar(100) NOT NULL,
  `walletpk` varchar(100) NOT NULL,
  `chainid` int(11) NOT NULL,
  `isFrozen` tinyint(1) NOT NULL,
  `secretphrase` varchar(300) DEFAULT NULL,
  `freezetime` int(11) DEFAULT '0',
  `nonce` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nonce_admin_table`
--

LOCK TABLES `nonce_admin_table` WRITE;
/*!40000 ALTER TABLE `nonce_admin_table` DISABLE KEYS */;
INSERT INTO `nonce_admin_table` VALUES (1,'0x9dD35f936298565Cc17c241fc645Eb4D1e04d895','2079696c01f5e53190aa1c72e57a72b93ca4ff165bf46d6ffef3129d108a879f',4,0,NULL,0,NULL),(2,'0x6077516eea959B7fb04bB211AD0569351f3eBDbc','8342678b959589fb5ad3cc593b410d892c8cb243363b2a30ee817070a89e8e8b',4,0,NULL,0,NULL),(3,'0x62E1960De1F9CA64d8fA578E871c2fe48b596b59','daedd37c356345aa579c5aff0a8d17e90fe9deec38054eb072fbbd10dd753942',4,0,NULL,0,NULL),(4,'0xF420Bc88E472191B936e7904b17DFD9E6043C12e','43f92fcfbecf0aa228b427f9f3958cf12a2ef9498310bbc26216445f54e7a47b',4,0,NULL,0,NULL),(5,'0xe72396544b18f229f7efE373c58B6948F75FaCD2','2905caabb2b6c6a057d40a0c7653d8b5c3f2189f8eb726d140b517a12a6f1d12',4,0,NULL,0,NULL),(11,'0x9dD35f936298565Cc17c241fc645Eb4D1e04d895','2079696c01f5e53190aa1c72e57a72b93ca4ff165bf46d6ffef3129d108a879f',24,0,NULL,0,NULL),(12,'0x6077516eea959B7fb04bB211AD0569351f3eBDbc','8342678b959589fb5ad3cc593b410d892c8cb243363b2a30ee817070a89e8e8b',24,0,NULL,0,NULL),(13,'0x62E1960De1F9CA64d8fA578E871c2fe48b596b59','daedd37c356345aa579c5aff0a8d17e90fe9deec38054eb072fbbd10dd753942',24,0,NULL,0,NULL),(14,'0xF420Bc88E472191B936e7904b17DFD9E6043C12e','43f92fcfbecf0aa228b427f9f3958cf12a2ef9498310bbc26216445f54e7a47b',24,0,NULL,0,NULL),(15,'0xe72396544b18f229f7efE373c58B6948F75FaCD2','2905caabb2b6c6a057d40a0c7653d8b5c3f2189f8eb726d140b517a12a6f1d12',24,0,NULL,0,NULL),(16,'0x9dD35f936298565Cc17c241fc645Eb4D1e04d895','2079696c01f5e53190aa1c72e57a72b93ca4ff165bf46d6ffef3129d108a879f',97,0,NULL,0,NULL),(17,'0x6077516eea959B7fb04bB211AD0569351f3eBDbc','8342678b959589fb5ad3cc593b410d892c8cb243363b2a30ee817070a89e8e8b',97,0,NULL,0,NULL),(18,'0x62E1960De1F9CA64d8fA578E871c2fe48b596b59','daedd37c356345aa579c5aff0a8d17e90fe9deec38054eb072fbbd10dd753942',97,0,NULL,0,NULL),(19,'0xF420Bc88E472191B936e7904b17DFD9E6043C12e','43f92fcfbecf0aa228b427f9f3958cf12a2ef9498310bbc26216445f54e7a47b',97,0,NULL,0,NULL),(20,'0xe72396544b18f229f7efE373c58B6948F75FaCD2','2905caabb2b6c6a057d40a0c7653d8b5c3f2189f8eb726d140b517a12a6f1d12',97,0,NULL,0,NULL),(21,'0xEEA4bC170C520A2790B8c567a54D6e14B3b14671','a40888cdc9c00fc2c8e99395fce8188f516117a72d896d5c755b4f64a3590c41',34,0,NULL,0,0),(23,'0x20a160445247547a7f57bbE4a452adcedE57c227','a1d38ff7abf982d413cd43c6bf4113df90de197971812d861675e3d86def9f1a',34,0,NULL,0,0),(24,'0xbc2754b978FEC7231697932933FE6f4be61230B2','af42b2fba98382cbd4c6591d7321caed7286d414c1ff625afcb4367655e0438f',34,0,NULL,0,0),(25,'0x5C27dCaD40946058767c9bd4b82641CA84590e5b','900a5982a2af60339bea88ddc1a5cbb16c2be9578c9b8bd83505d2a879a4fa90',34,0,NULL,0,0),(26,'0x19d83a8A59cd8c7Fb5bD2484ad93670610DE3fb5','c357ee55eefe3f5048c07855fee376984fc0dcd97112468b72ed445b7b095c9e',34,0,NULL,0,0),(27,'0x5B090d99717Ff10a523455062a9726B7C49cAe2c','1574f550fd80ff2214715ccc8a729ded4dd80dad2d48c831f820ee82e05c071f',256,0,NULL,0,NULL),(28,'0x9Bc088871972F6d7bd883dc32f21dD7E04A282Ce','e614297a29835e45d89a36960fe6d7f8b2a02c91a3f324f3eb9038c6d2699b20',256,0,NULL,0,NULL),(29,'0xb143740C642175E9EC24C451919dfb78f7cD692a','cf8b7a49918e0b084d64845ccfd4db2f7366674519f4cd606d9bc97f6c6a9d6d',80001,0,NULL,0,0),(30,'0x0f5167c2A6D575eFD3475783c285ACeFd4BdAD7C','8c43925b41c3aafcc306466fe1a6dc972cbeebe0951bb95c8076b2940e9a67df',80001,0,NULL,0,0),(31,'0x553D5CDe3cD4159cD5E497266d4e9d5A06dAb454','9ce636082ec4615e30141588575e1fc4949f172af42d6265a94e18dc4d587082',80001,0,NULL,0,0),(32,'0x0C94d6A85D5F922DF83CA326C284C50c5476C185','57d939aede512bd7475cf2b0a6c4b25755edd7ed51455c4bece648e6516e40b5',137,0,NULL,0,NULL);
/*!40000 ALTER TABLE `nonce_admin_table` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'DTH_ADMIN_DB'
--

--
-- Dumping routines for database 'DTH_ADMIN_DB'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-02-15 12:51:33