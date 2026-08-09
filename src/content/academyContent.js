import galleryAnbanImage from '../assets/book_images/gallery/anban.jpeg';
import galleryStateToppersImage from '../assets/book_images/gallery/honoring-state-toppers.jpeg';
import galleryArulmozhiImage from '../assets/book_images/gallery/ms_arulmozhi.jpeg';
import managementChellappanImage from '../assets/book_images/management/dr-chellappan-ias.jpeg';
import managementDevadossImage from '../assets/book_images/management/prof-devadoss.jpeg';

export const ACADEMY_VISION_TEXT =
  'To be a change agent in developing a just and compassionate Indian society in which all people have fair and equitable opportunities to achieve their optimum potential through charitable, holistic, and sustainable development work among the marginalised, downtrodden, vulnerable, and exploited.';

export const ACADEMY_MISSION_TEXT =
  'To empower people through effective communication and awareness programmes, strengthen their voice, and improve their participation in promoting their socio-educational and economic status through a rationalistic and scientific approach to establish a just and democratic social order.';

export const ACADEMY_TABS = [
  {
    id: 'about',
    label: 'About',
    pages: [
      {
        left: {
          title: 'About<br />Dr.&nbsp;Ambedkar<br />Academy',
          body: ''
        },
        right: {
          yearTitle: "'70s",
          body:
            "The People's Educational Trust – Dr. Ambedkar Academy is a unique organisation with the privilege of serving marginalised people for over 45 years. It blossomed from informal monthly gatherings of socially conscious intellectuals way back in the 1970s to discuss and deliberate on issues concerning the development of marginalised people."
        }
      },
      {
        left: {
          yearTitle: '1976',
          body:
            'These monthly meetings stirred the conscience of people with social concerns, culminating in the formation of a formal society, namely the People’s Educational, Social and Cultural Society, registered in 1976 under the Societies Registration Act.'
        },
        right: {
          yearTitle: '1996',
          body: 'In 1996, the Society was converted into The People’s Educational Trust as a public charitable trust, broadening its activities.'
        }
      }
    ]
  },
  {
    id: 'gallery',
    label: 'Gallery',
    pages: [
      {
        left: {
          title: 'Gallery',
          body: 'Moments from the Academy’s continuous public service and outreach.'
        },
        right: {
          layout: 'image',
          body: 'Honoring Class 10 and 12 state toppers for the year 2026 by Minister of Social Justice, Government of Tamil Nadu, Thiru. Vanni Arasu.',
          imageSrc: galleryStateToppersImage,
          imageAlt: 'Minister of Social Justice, Government of Tamil Nadu, Thiru. Vanni Arasu honoring Class 10 and 12 state toppers for the year 2026'
        }
      },
      {
        left: {
          layout: 'image',
          body: 'An address by Thiru E. Anban on the New Government and our people\'s expectations.',
          imageSrc: galleryAnbanImage,
          imageAlt: 'Thiru E. Anban addressing the gathering on the New Government and our people\'s expectations'
        },
        right: {
          layout: 'image',
          body: 'An address by Ms. Arulmozhi, eminent advocate on the Constitution of India: Dr. Ambedkar\'s Vision and its Contemporary Relevance.',
          imageSrc: galleryArulmozhiImage,
          imageAlt: 'Ms. Arulmozhi addressing the gathering on the Constitution of India: Dr. Ambedkar\'s Vision and its Contemporary Relevance'
        }
      }
    ]
  },
  {
    id: 'management',
    label: 'Management',
    pages: [
      {
        left: {
          title: 'Management',
          body:
            'The Trust is managed by people of eminence commanding high respect in society. The management comprises the Managing Trustee and 24 Trustees drawn from diverse fields.'
        },
        right: {
          layout: 'image',
          imageSrc: managementChellappanImage,
          imageAlt: 'Photo of Thiru C. Chellappan, IAS Retired',
          subTitle: 'Thiru C. Chellappan, IAS (Retd.)',
          body:
            'Former Secretary to the Government of Tamil Nadu, former Member of TNPSC, and former Member of the National Commission for Scheduled Castes & Scheduled Tribes, serves as the Managing Trustee.'
        }
      },
      {
        left: {
          layout: 'image',
          imageSrc: managementDevadossImage,
          imageAlt: 'Photo of Prof. S. Devadoss',
          subTitle: 'Prof. S. Devadoss',
          body:
            'Prof. S. Devadoss is the Joint Managing Trustee of Dr. Ambedkar Academy.'
        },
        right: {
          layout: 'image',
          subTitle: 'Dr. A. Padmanaban, IAS (Retd.)',
          body:
            'Dr. A. Padmanaban, IAS (Retd.) is the chief architect of the Trust. He has served as Governor of Mizoram, Chief Secretary to the Government of Tamil Nadu, Adviser to the Governor of Tamil Nadu, Member of UPSC, and President of the World Poet Organisation.'
        }
      }
    ]
  }
];
